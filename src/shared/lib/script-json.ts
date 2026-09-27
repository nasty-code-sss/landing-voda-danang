const HTML_OPENING_BRACKET = /</g;
const ESCAPED_OPENING_BRACKET = '\\u003c';

export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(HTML_OPENING_BRACKET, ESCAPED_OPENING_BRACKET);
}
