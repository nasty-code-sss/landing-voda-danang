import type { MessengerId } from '../config/site-config';
import { fillTemplate } from '../i18n/template';
import { anchorHref, PAGE_ANCHOR } from '../lib/page-anchor';

export interface MessengerContact {
  readonly id: MessengerId;
  readonly linkTemplate: string | null;
  readonly contact: string;
}

const PREFILLED_TEXT_PARAMETER = 'text';
const PHONE_CALL_SCHEME = 'tel:';
const CONTACT_CARD_HREF = anchorHref(PAGE_ANCHOR.wechat);

export const CONTACT_CARD_MESSENGER = 'wechat' satisfies MessengerId;

const MESSENGERS_WITH_PREFILLED_TEXT: ReadonlySet<MessengerId> = new Set<MessengerId>(['whatsapp', 'telegram']);

export function acceptsPrefilledText(id: MessengerId): boolean {
  return MESSENGERS_WITH_PREFILLED_TEXT.has(id);
}

export function opensMessengerApp(messenger: MessengerContact): boolean {
  return messenger.linkTemplate !== null;
}

export function chatLink(messenger: MessengerContact, text?: string): string {
  if (messenger.linkTemplate === null) {
    return CONTACT_CARD_HREF;
  }
  const chatUrl = fillTemplate(messenger.linkTemplate, { contact: encodeURIComponent(messenger.contact) });
  if (text === undefined || text.length === 0 || !acceptsPrefilledText(messenger.id)) {
    return chatUrl;
  }
  return `${chatUrl}?${PREFILLED_TEXT_PARAMETER}=${encodeURIComponent(text)}`;
}

export function phoneCallLink(phone: string): string {
  return `${PHONE_CALL_SCHEME}${phone}`;
}
