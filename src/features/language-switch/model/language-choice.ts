const LANGUAGE_TAG_SEPARATOR = '-';

export function isSupportedLanguage(value: string | null, supported: readonly string[]): value is string {
  return value !== null && supported.includes(value);
}

export function preferredLanguage(browserLanguages: readonly string[], supported: readonly string[]): string | null {
  for (const tag of browserLanguages) {
    const primary = tag.toLowerCase().split(LANGUAGE_TAG_SEPARATOR)[0] ?? '';
    if (supported.includes(primary)) {
      return primary;
    }
  }
  return null;
}
