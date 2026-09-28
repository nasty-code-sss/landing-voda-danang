import { readStoredValue } from '../../../shared/api/browser-storage';
import { languageToOpen } from '../model/language-choice';

function currentSelection(): string {
  return `${window.location.search}${window.location.hash}`;
}

export function mountLanguagePicker(picker: HTMLElement): void {
  const options = [...picker.querySelectorAll<HTMLAnchorElement>('[data-language-option]')];
  const language = languageToOpen({
    remembered: readStoredValue(picker.dataset.storageKey ?? ''),
    browserLanguages: navigator.languages,
    supported: options.map((option) => option.dataset.language ?? ''),
    fallback: picker.dataset.defaultLanguage ?? '',
  });
  const path = options.find((option) => option.dataset.language === language)?.dataset.path;
  if (path === undefined) {
    picker.removeAttribute('data-pending');
    return;
  }
  window.location.replace(`${path}${currentSelection()}`);
}
