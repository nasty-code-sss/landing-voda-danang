import { readStoredValue, storeValue } from '../../../shared/api/browser-storage';
import { isSupportedLanguage, preferredLanguage } from '../model/language-choice';

function currentSelection(): string {
  return `${window.location.search}${window.location.hash}`;
}

export function mountLanguagePicker(picker: HTMLElement): void {
  const storageKey = picker.dataset.storageKey ?? '';
  const options = [...picker.querySelectorAll<HTMLAnchorElement>('[data-language-option]')];
  const supported = options.map((option) => option.dataset.language ?? '');
  const pathOf = (language: string) => options.find((option) => option.dataset.language === language)?.dataset.path;

  const remembered = readStoredValue(storageKey);
  const rememberedPath = isSupportedLanguage(remembered, supported) ? pathOf(remembered) : undefined;
  if (rememberedPath !== undefined) {
    window.location.replace(`${rememberedPath}${currentSelection()}`);
    return;
  }

  const preferred = preferredLanguage(navigator.languages, supported);
  for (const option of options) {
    const { language = '', path = '' } = option.dataset;
    option.href = `${path}${currentSelection()}`;
    option.toggleAttribute('data-preferred', language === preferred);
    option.addEventListener('click', () => storeValue(storageKey, language));
  }
  picker.removeAttribute('data-pending');
}
