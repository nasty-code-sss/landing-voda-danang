import { copyText } from '../../../shared/api/clipboard';

export function mountLandlordLinks(block: HTMLElement): void {
  const status = block.querySelector<HTMLElement>('[data-landlord-status]');
  const message = block.dataset.message ?? '';
  const copiedNote = block.dataset.copiedNote ?? '';
  const showCopied = (copied: boolean) => {
    if (status !== null) {
      status.textContent = copied ? copiedNote : '';
    }
  };
  block.querySelectorAll<HTMLAnchorElement>('[data-landlord-link]').forEach((link) => {
    link.addEventListener('click', () => {
      copyText(message).then(showCopied, () => showCopied(false));
    });
  });
}
