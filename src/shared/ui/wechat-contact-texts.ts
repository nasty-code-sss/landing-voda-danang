import type { Translate } from '../i18n/dictionary';

export interface WeChatContactTexts {
  readonly idLabel: string;
  readonly copyId: string;
  readonly idCopied: string;
  readonly qrLabel: string;
}

export function weChatContactTexts(say: Translate): WeChatContactTexts {
  return {
    idLabel: say('wechat.id_label'),
    copyId: say('wechat.copy_id'),
    idCopied: say('wechat.id_copied'),
    qrLabel: say('wechat.qr_label'),
  };
}
