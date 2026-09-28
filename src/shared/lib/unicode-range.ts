const RANGE_SEPARATOR = ',';
const BOUNDS_SEPARATOR = '-';
const RANGE_PREFIX = /^U\+/i;
const WILDCARD = /\?/g;
const LOWEST_HEX_DIGIT = '0';
const HIGHEST_HEX_DIGIT = 'f';
const HEX_RADIX = 16;

export interface CodePointRange {
  readonly from: number;
  readonly to: number;
}

function parseRange(part: string): CodePointRange {
  const value = part.trim().replace(RANGE_PREFIX, '');
  const [start = '', end] = value.split(BOUNDS_SEPARATOR);
  const from = start.replace(WILDCARD, LOWEST_HEX_DIGIT);
  const to = (end ?? start).replace(WILDCARD, HIGHEST_HEX_DIGIT);
  return { from: Number.parseInt(from, HEX_RADIX), to: Number.parseInt(to, HEX_RADIX) };
}

export function parseUnicodeRange(value: string): CodePointRange[] {
  return value.split(RANGE_SEPARATOR).map(parseRange);
}

export function codePointsOf(text: string): number[] {
  return [...new Set([...text].map((character) => character.codePointAt(0) ?? 0))];
}

export function coversAny(ranges: readonly CodePointRange[], codePoints: readonly number[]): boolean {
  return codePoints.some((point) => ranges.some((range) => point >= range.from && point <= range.to));
}
