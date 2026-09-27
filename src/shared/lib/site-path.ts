export function sitePath(base: string, ...segments: readonly string[]): string {
  const parts = [base, ...segments].flatMap((part) => part.split('/')).filter((part) => part.length > 0);
  return parts.length === 0 ? '/' : `/${parts.join('/')}/`;
}
