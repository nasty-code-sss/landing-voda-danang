import { copyText } from '../api/clipboard';

export function mountWeChatContact(block: HTMLElement): void {
  const button = block.querySelector<HTMLButtonElement>('[data-wechat-copy]');
  const status = block.querySelector<HTMLElement>('[data-wechat-status]');
  const wechatId = block.querySelector<HTMLElement>('[data-wechat-id]')?.textContent?.trim() ?? '';
  const copiedNote = block.dataset.copiedNote ?? '';
  const showCopied = (copied: boolean) => {
    if (status !== null) {
      status.textContent = copied ? copiedNote : '';
    }
  };
  button?.addEventListener('click', () => {
    copyText(wechatId).then(showCopied, () => showCopied(false));
  });
}
