const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const HTML_SPECIAL_CHARACTERS = /[&<>"']/g;

export function escapeHtml(value: string): string {
  return value.replace(HTML_SPECIAL_CHARACTERS, (character) => HTML_ESCAPES[character] ?? character);
}

export function foreignText(value: string, language: string): string {
  return `<span lang="${escapeHtml(language)}">${escapeHtml(value)}</span>`;
}
