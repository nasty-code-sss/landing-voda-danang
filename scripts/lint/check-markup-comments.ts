import { globSync, readFileSync } from 'node:fs';

const MARKUP_FILES = ['src/**/*.astro', 'src/**/*.css', 'public/**/*.svg'];
const HTML_COMMENT = /<!--/g;
const CSS_COMMENT = /\/\*/g;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;
const LINE_BREAK = '\n';

interface Finding {
  readonly file: string;
  readonly line: number;
}

function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split(LINE_BREAK).length;
}

function offsetsOf(pattern: RegExp, text: string, shift = 0): number[] {
  return [...text.matchAll(pattern)].map((match) => shift + match.index);
}

function cssCommentOffsets(file: string, text: string): number[] {
  if (file.endsWith('.css')) {
    return offsetsOf(CSS_COMMENT, text);
  }
  return [...text.matchAll(STYLE_BLOCK)].flatMap((block) => {
    const body = block[1] ?? '';
    return offsetsOf(CSS_COMMENT, body, block.index + block[0].indexOf(body));
  });
}

function findingsIn(file: string): Finding[] {
  const text = readFileSync(file, 'utf8');
  return [...offsetsOf(HTML_COMMENT, text), ...cssCommentOffsets(file, text)].map((offset) => ({
    file,
    line: lineAt(text, offset),
  }));
}

const findings = MARKUP_FILES.flatMap((pattern) => globSync(pattern)).flatMap(findingsIn);

for (const finding of findings) {
  console.error(`${finding.file}:${finding.line} markup and styles carry no comments`);
}
process.exitCode = findings.length === 0 ? 0 : 1;
