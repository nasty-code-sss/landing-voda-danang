import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { codePointsOf, coversAny, parseUnicodeRange } from '../lib/unicode-range';

type SatoriInput = Parameters<typeof satori>[0];
type SatoriFont = Parameters<typeof satori>[1]['fonts'][number];
type SatoriWeight = NonNullable<SatoriFont['weight']>;

export interface ShareElement {
  readonly type: string;
  readonly props: Readonly<Record<string, unknown>>;
}

export interface ShareFontSource {
  readonly packageName: string;
  readonly subsets: readonly string[];
  readonly weights: readonly number[];
}

export interface ShareScriptFontSource {
  readonly packageName: string;
  readonly weights: readonly number[];
  readonly text: string;
}

export interface ShareFonts {
  readonly stack: string;
  readonly faces: readonly SatoriFont[];
}

export interface ShareImageSize {
  readonly width: number;
  readonly height: number;
}

const NODE_MODULES = 'node_modules';
const FONT_FILES_DIRECTORY = 'files';
const FONT_STYLE = 'normal' as const;
const FONT_FORMAT = 'woff';
const PACKAGE_SEPARATOR = '/';
const FONT_STACK_SEPARATOR = ', ';
const SATORI_WEIGHTS: readonly number[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const STYLESHEET_EXTENSION = '.css';
const FONT_FACE_BLOCK = /@font-face\s*\{([^}]*)\}/g;
const WOFF_FILE = /url\(\.\/files\/([^)]+\.woff)\)/;
const UNICODE_RANGE = /unicode-range:\s*([^;]+);/;
const TEXT_ENCODING = 'utf8';

function isSatoriWeight(weight: number): weight is SatoriWeight {
  return SATORI_WEIGHTS.includes(weight);
}

function familySlug(packageName: string): string {
  return packageName.split(PACKAGE_SEPARATOR).at(-1) ?? packageName;
}

export function loadShareFonts(projectRoot: string, source: ShareFontSource): ShareFonts {
  const slug = familySlug(source.packageName);
  const directory = join(projectRoot, NODE_MODULES, source.packageName, FONT_FILES_DIRECTORY);
  const familyOf = (subset: string) => `${slug} ${subset}`;
  const faces = source.subsets.flatMap((subset) =>
    source.weights.filter(isSatoriWeight).map((weight) => ({
      name: familyOf(subset),
      weight,
      style: FONT_STYLE,
      data: readFileSync(join(directory, `${slug}-${subset}-${weight}-${FONT_STYLE}.${FONT_FORMAT}`)),
    })),
  );
  return { stack: source.subsets.map(familyOf).join(FONT_STACK_SEPARATOR), faces };
}

function chunkFamily(file: string, weight: number): string {
  return file.replace(`-${weight}-${FONT_STYLE}.${FONT_FORMAT}`, '');
}

function neededChunks(stylesheet: string, codePoints: readonly number[]): string[] {
  return [...stylesheet.matchAll(FONT_FACE_BLOCK)].flatMap(([, block = '']) => {
    const file = WOFF_FILE.exec(block)?.[1];
    const range = UNICODE_RANGE.exec(block)?.[1];
    if (file === undefined || range === undefined || !coversAny(parseUnicodeRange(range), codePoints)) {
      return [];
    }
    return [file];
  });
}

export function loadScriptFonts(projectRoot: string, source: ShareScriptFontSource): ShareFonts {
  const packageDirectory = join(projectRoot, NODE_MODULES, source.packageName);
  const codePoints = codePointsOf(source.text);
  const faces = source.weights.filter(isSatoriWeight).flatMap((weight) => {
    const stylesheet = readFileSync(join(packageDirectory, `${weight}${STYLESHEET_EXTENSION}`), TEXT_ENCODING);
    return neededChunks(stylesheet, codePoints).map((file) => ({
      name: chunkFamily(file, weight),
      weight,
      style: FONT_STYLE,
      data: readFileSync(join(packageDirectory, FONT_FILES_DIRECTORY, file)),
    }));
  });
  const families = [...new Set(faces.map((face) => face.name))];
  return { stack: families.join(FONT_STACK_SEPARATOR), faces };
}

export function combineShareFonts(primary: ShareFonts, fallback: ShareFonts): ShareFonts {
  if (fallback.faces.length === 0) {
    return primary;
  }
  return {
    stack: [primary.stack, fallback.stack].join(FONT_STACK_SEPARATOR),
    faces: [...primary.faces, ...fallback.faces],
  };
}

export async function renderSharePng(
  element: ShareElement,
  size: ShareImageSize,
  fonts: ShareFonts,
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(element as unknown as SatoriInput, {
    width: size.width,
    height: size.height,
    fonts: [...fonts.faces],
  });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: size.width } }).render().asPng());
}
