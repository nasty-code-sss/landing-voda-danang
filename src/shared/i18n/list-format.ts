export type ListKind = 'conjunction' | 'disjunction';

export function formatList(items: readonly string[], language: string, kind: ListKind): string {
  return new Intl.ListFormat(language, { style: 'long', type: kind }).format(items);
}

export function capitalizeFirst(text: string, language: string): string {
  const [first = '', ...rest] = [...text];
  return `${first.toLocaleUpperCase(language)}${rest.join('')}`;
}
