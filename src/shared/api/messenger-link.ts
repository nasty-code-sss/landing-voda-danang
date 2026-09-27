import type { MessengerId } from '../config/site-config';

export interface MessengerContact {
  readonly id: MessengerId;
  readonly baseUrl: string;
  readonly contact: string;
}

const PREFILLED_TEXT_PARAMETER = 'text';
const PHONE_CALL_SCHEME = 'tel:';

const MESSENGERS_WITH_PREFILLED_TEXT: ReadonlySet<MessengerId> = new Set<MessengerId>(['whatsapp', 'telegram']);

export function acceptsPrefilledText(id: MessengerId): boolean {
  return MESSENGERS_WITH_PREFILLED_TEXT.has(id);
}

export function chatLink(messenger: MessengerContact, text?: string): string {
  const chatUrl = new URL(messenger.contact, messenger.baseUrl).toString();
  if (text === undefined || text.length === 0 || !acceptsPrefilledText(messenger.id)) {
    return chatUrl;
  }
  return `${chatUrl}?${PREFILLED_TEXT_PARAMETER}=${encodeURIComponent(text)}`;
}

export function phoneCallLink(phone: string): string {
  return `${PHONE_CALL_SCHEME}${phone}`;
}
