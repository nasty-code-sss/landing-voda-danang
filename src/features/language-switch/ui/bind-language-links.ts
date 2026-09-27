import { storeValue } from '../../../shared/api/browser-storage';

function carryCurrentSelection(link: HTMLAnchorElement): void {
  const { language, path, storageKey } = link.dataset;
  if (language === undefined || path === undefined || storageKey === undefined) {
    return;
  }
  storeValue(storageKey, language);
  link.href = `${path}${window.location.search}${window.location.hash}`;
}

export function bindLanguageLinks(root: ParentNode): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach((link) => {
    link.addEventListener('click', () => carryCurrentSelection(link));
  });
}
