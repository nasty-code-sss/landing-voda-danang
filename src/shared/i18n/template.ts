export const PLACEHOLDER = /\{(\w+)\}/g;

export function fillTemplate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) => (name in values ? String(values[name]) : placeholder));
}
