import type { Brand } from '../../../entities/brand/model/brand';
import type { MissingOrderPart, PaymentMethod, QuantityLimits } from '../../../entities/order/model/order';
import type { MessageLanguage, OrderMessageTexts } from '../../../entities/order/model/order-message';
import type { Pump } from '../../../entities/pump/model/pump';
import type { MessengerContact } from '../../../shared/api/messenger-link';
import type { SiteConfig } from '../../../shared/config/site-config';
import { dictionaryFor, text, type Dictionaries, type Dictionary } from '../../../shared/i18n/dictionary';
import type { PluralForms } from '../../../shared/i18n/plural';

export interface MessengerTarget extends MessengerContact {
  readonly label: string;
}

export interface BuilderTexts {
  readonly bottles: PluralForms;
  readonly quantityMinimum: string;
  readonly quantityMaximum: string;
  readonly missing: Readonly<Record<MissingOrderPart, string>>;
  readonly geoPending: string;
  readonly geoOk: string;
  readonly geoFailed: string;
  readonly todayClosed: string;
  readonly sendCopied: string;
  readonly sendCopyFailed: string;
  readonly platePhoto: string;
  readonly previewEmpty: string;
}

export interface BuilderData {
  readonly language: string;
  readonly currency: string;
  readonly timeZone: string;
  readonly sameDayUntil: string;
  readonly limits: QuantityLimits;
  readonly coordinateDecimals: number;
  readonly mapsSearchUrl: string;
  readonly geolocation: { readonly timeoutMs: number; readonly maximumAgeMs: number };
  readonly brands: readonly Brand[];
  readonly pumps: readonly Pump[];
  readonly payments: readonly PaymentMethod[];
  readonly messengers: readonly MessengerTarget[];
  readonly texts: BuilderTexts;
  readonly message: MessageLanguage;
  readonly messageCopy: MessageLanguage | null;
}

export function brandsFromConfig(config: SiteConfig): Brand[] {
  return config.brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    waterType: brand.water,
    volumeLiters: brand.volumeLiters,
    price: brand.price,
    deposit: brand.deposit,
    hasTap: brand.tap,
    isExample: brand.example,
  }));
}

export function messengersFor(config: SiteConfig, dictionary: Dictionary, language: string): MessengerTarget[] {
  const order = config.messengers.order[language] ?? [];
  return order.map((id) => ({
    id,
    baseUrl: config.messengers.links[id],
    contact: config.contacts[id],
    label: text(dictionary, `messenger.${id}`),
  }));
}

function messageTexts(config: SiteConfig, dictionary: Dictionary): OrderMessageTexts {
  const say = (key: string) => text(dictionary, key);
  return {
    greeting: say('message.greeting'),
    heading: say('message.heading'),
    brand: say('message.brand'),
    literUnit: say('message.liter_unit'),
    type: say('message.type'),
    typeFirst: say('message.type.first'),
    typeRefill: say('message.type.refill'),
    pump: say('message.pump'),
    pumpNames: Object.fromEntries(config.pumps.map((pump) => [pump.id, say(`pump.${pump.id}`)])),
    location: say('message.location'),
    address: say('message.address'),
    when: say('message.when'),
    today: say('message.today'),
    tomorrow: say('message.tomorrow'),
    payment: say('message.payment'),
    paymentMethods: { cash: say('message.payment.cash'), transfer: say('message.payment.transfer') },
    total: say('message.total'),
    totalWater: say('message.total.water'),
    totalDeposit: say('message.total.deposit'),
    totalPump: say('message.total.pump'),
  };
}

function builderTexts(dictionary: Dictionary): BuilderTexts {
  const say = (key: string) => text(dictionary, key);
  return {
    bottles: {
      one: say('bottles.one'),
      few: say('bottles.few'),
      many: say('bottles.many'),
      other: say('bottles.other'),
    },
    quantityMinimum: say('builder.quantity.minimum'),
    quantityMaximum: say('builder.quantity.maximum'),
    missing: { brand: say('builder.missing.brand'), location: say('builder.missing.location') },
    geoPending: say('builder.location.geo_pending'),
    geoOk: say('builder.location.geo_ok'),
    geoFailed: say('builder.location.geo_failed'),
    todayClosed: say('builder.day.today_closed'),
    sendCopied: say('builder.send.copied'),
    sendCopyFailed: say('builder.send.copy_failed'),
    platePhoto: say('builder.send.plate_photo'),
    previewEmpty: say('builder.preview.empty'),
  };
}

export function createBuilderData(config: SiteConfig, dictionaries: Dictionaries, language: string): BuilderData {
  const dictionary = dictionaryFor(dictionaries, language);
  const copyLanguage = config.languages.messageCopy;
  return {
    language,
    currency: config.money.currency,
    timeZone: config.time.zone,
    sameDayUntil: config.delivery.sameDayUntil,
    limits: { minimum: config.order.minQuantity, maximum: config.order.maxQuantity },
    coordinateDecimals: config.order.coordinateDecimals,
    mapsSearchUrl: config.maps.searchUrl,
    geolocation: config.geolocation,
    brands: brandsFromConfig(config),
    pumps: config.pumps,
    payments: config.payments,
    messengers: messengersFor(config, dictionary, language),
    texts: builderTexts(dictionary),
    message: { language, texts: messageTexts(config, dictionary) },
    messageCopy:
      copyLanguage === language
        ? null
        : { language: copyLanguage, texts: messageTexts(config, dictionaryFor(dictionaries, copyLanguage)) },
  };
}
