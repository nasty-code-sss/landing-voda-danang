import type { BuilderData } from './builder-data';

const HTML_OPENING_BRACKET = /</g;
const ESCAPED_OPENING_BRACKET = '\\u003c';

export function serializeBuilderData(data: BuilderData): string {
  return JSON.stringify(data).replace(HTML_OPENING_BRACKET, ESCAPED_OPENING_BRACKET);
}

export function parseBuilderData(serialized: string): BuilderData {
  return JSON.parse(serialized) as BuilderData;
}
