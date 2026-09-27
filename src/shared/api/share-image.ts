import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

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

export async function renderSharePng(element: ShareElement, size: ShareImageSize, fonts: ShareFonts): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(element as unknown as SatoriInput, {
    width: size.width,
    height: size.height,
    fonts: [...fonts.faces],
  });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: size.width } }).render().asPng());
}
