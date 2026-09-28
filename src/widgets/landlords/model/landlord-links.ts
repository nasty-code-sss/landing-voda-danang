import { withOperatorCopy } from '../../../entities/order/model/order-message';
import { messengersFor } from '../../../features/order-builder/model/builder-data';
import { chatLink, opensMessengerApp } from '../../../shared/api/messenger-link';
import type { MessengerId, SiteConfig } from '../../../shared/config/site-config';
import { dictionaryFor, text, type Dictionaries } from '../../../shared/i18n/dictionary';

export const LANDLORD_MESSAGE_KEY = 'landlords.message';

export interface LandlordLink {
  readonly id: MessengerId;
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

export function landlordMessage(config: SiteConfig, dictionaries: Dictionaries, language: string): string {
  const say = (targetLanguage: string) => text(dictionaryFor(dictionaries, targetLanguage), LANDLORD_MESSAGE_KEY);
  const copyLanguage = config.languages.messageCopy;
  return withOperatorCopy(say(language), copyLanguage === language ? null : say(copyLanguage));
}

export function landlordLinks(config: SiteConfig, dictionaries: Dictionaries, language: string): LandlordLink[] {
  const message = landlordMessage(config, dictionaries, language);
  return messengersFor(config, dictionaryFor(dictionaries, language), language).map((messenger) => ({
    id: messenger.id,
    label: messenger.label,
    href: chatLink(messenger, message),
    external: opensMessengerApp(messenger),
  }));
}
