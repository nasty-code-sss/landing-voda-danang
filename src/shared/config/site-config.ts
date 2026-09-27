import { z } from 'zod';
import { WEEKDAY_ORDER } from '../i18n/weekday-name';

const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const IDENTIFIER = /^[a-z0-9-]+$/;
const LANGUAGE_CODE = /^[a-z]{2}$/;
const INTERNATIONAL_PHONE = /^\+\d{6,15}$/;
const DIGITS_ONLY_PHONE = /^\d{6,15}$/;
const TELEGRAM_USERNAME = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const CURRENCY_CODE = /^[A-Z]{3}$/;
const COUNTRY_CODE = /^[A-Z]{2}$/;
const FONT_WEIGHT_RANGE = /^\d{3}( \d{3})?$/;
const JAVASCRIPT_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const clockTime = z.string().regex(CLOCK_TIME);
const identifier = z.string().regex(IDENTIFIER);
const languageCode = z.string().regex(LANGUAGE_CODE);
const amount = z.int().nonnegative();
const messengerId = z.enum(['whatsapp', 'telegram', 'zalo']);
const nonEmptyText = z.string().min(1);
const fontSubset = z.string().regex(IDENTIFIER);

const rawSiteConfigSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    slug: identifier,
  }),
  site: z.object({
    url: z.url(),
    base: z.string().startsWith('/'),
    noindex: z.boolean(),
    demo: z.boolean(),
  }),
  languages: z.object({
    default: languageCode,
    supported: z.array(languageCode).min(1),
    message_copy: languageCode,
    local: languageCode,
  }),
  money: z.object({
    currency: z.string().regex(CURRENCY_CODE),
  }),
  time: z.object({
    zone: z.string().min(1),
  }),
  contacts: z.object({
    phone: z.string().regex(INTERNATIONAL_PHONE),
    whatsapp: z.string().regex(DIGITS_ONLY_PHONE),
    telegram: z.string().regex(TELEGRAM_USERNAME),
    zalo: z.string().regex(DIGITS_ONLY_PHONE),
  }),
  warehouse: z.object({
    street: nonEmptyText,
    city: nonEmptyText,
    country: z.string().regex(COUNTRY_CODE),
  }),
  owner: z.object({
    name: nonEmptyText,
    address: nonEmptyText,
    registration_number: nonEmptyText,
  }),
  order: z.object({
    min_quantity: z.int().positive(),
    max_quantity: z.int().positive(),
    coordinate_decimals: z.int().min(0).max(8),
  }),
  delivery: z.object({
    same_day_until: clockTime,
    opens_at: clockTime,
    closes_at: clockTime,
    days: z.array(z.enum(WEEKDAY_ORDER)).min(1),
  }),
  zone: z
    .array(
      z.object({
        id: identifier,
        name: nonEmptyText,
        former: z.array(nonEmptyText),
      }),
    )
    .min(1),
  trust: z.object({
    sealed_bottles: z.boolean(),
    washed_bottles: z.boolean(),
    official_dealer: z.boolean(),
    photo_before_delivery: z.boolean(),
  }),
  brands: z
    .array(
      z.object({
        id: identifier,
        name: z.string().min(1),
        water: z.enum(['purified', 'mineral']),
        volume_liters: z.number().positive(),
        price: amount,
        deposit: amount,
        tap: z.boolean(),
        example: z.boolean(),
      }),
    )
    .min(1),
  pumps: z.array(
    z.object({
      id: identifier,
      price: amount,
    }),
  ),
  payments: z.array(z.enum(['cash', 'transfer'])).min(1),
  messengers: z.object({
    order: z.record(languageCode, z.array(messengerId).min(1)),
    links: z.object({
      whatsapp: z.url(),
      telegram: z.url(),
      zalo: z.url(),
    }),
  }),
  maps: z.object({
    search_url: z.url(),
  }),
  geolocation: z.object({
    timeout_ms: z.int().positive(),
    maximum_age_ms: z.int().nonnegative(),
  }),
  browser_storage: z.object({
    language_key: nonEmptyText,
    last_order_key: nonEmptyText,
  }),
  analytics: z.object({
    queue_name: z.string().regex(JAVASCRIPT_IDENTIFIER),
  }),
  design: z.object({
    font: z.object({
      package: nonEmptyText,
      family: nonEmptyText,
      weights: z.string().regex(FONT_WEIGHT_RANGE),
      subsets: z.array(fontSubset).min(1),
    }),
    share_image: z.object({
      font_package: nonEmptyText,
      font_weights: z.array(z.int().min(100).max(900)).min(1),
      width: z.int().positive(),
      height: z.int().positive(),
    }),
  }),
});

type RawSiteConfig = z.infer<typeof rawSiteConfigSchema>;

function duplicates(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function isKnownTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }
    throw error;
  }
}

function findConsistencyProblems(raw: RawSiteConfig): string[] {
  const problems: string[] = [];
  const { supported } = raw.languages;

  if (raw.order.min_quantity > raw.order.max_quantity) {
    problems.push('order.min_quantity is greater than order.max_quantity');
  }
  if (!supported.includes(raw.languages.default)) {
    problems.push(`languages.default "${raw.languages.default}" is not in languages.supported`);
  }
  if (!supported.includes(raw.languages.message_copy)) {
    problems.push(`languages.message_copy "${raw.languages.message_copy}" is not in languages.supported`);
  }
  if (!supported.includes(raw.languages.local)) {
    problems.push(`languages.local "${raw.languages.local}" is not in languages.supported`);
  }
  for (const language of supported) {
    const order = raw.messengers.order[language];
    if (order === undefined) {
      problems.push(`messengers.order has no entry for language "${language}"`);
    } else if (duplicates(order).length > 0) {
      problems.push(`messengers.order.${language} repeats ${duplicates(order).join(', ')}`);
    }
  }
  const brandIds = raw.brands.map((brand) => brand.id);
  if (duplicates(brandIds).length > 0) {
    problems.push(`brands repeat id ${duplicates(brandIds).join(', ')}`);
  }
  const exampleBrands = raw.brands.filter((brand) => brand.example);
  if (exampleBrands.length !== 1) {
    problems.push(`exactly one brand must have example: true, found ${exampleBrands.length}`);
  }
  const pumpIds = raw.pumps.map((pump) => pump.id);
  if (duplicates(pumpIds).length > 0) {
    problems.push(`pumps repeat id ${duplicates(pumpIds).join(', ')}`);
  }
  if (duplicates(raw.payments).length > 0) {
    problems.push(`payments repeat ${duplicates(raw.payments).join(', ')}`);
  }
  const zoneIds = raw.zone.map((area) => area.id);
  if (duplicates(zoneIds).length > 0) {
    problems.push(`zone repeats id ${duplicates(zoneIds).join(', ')}`);
  }
  if (duplicates(raw.delivery.days).length > 0) {
    problems.push(`delivery.days repeat ${duplicates(raw.delivery.days).join(', ')}`);
  }
  if (!isKnownTimeZone(raw.time.zone)) {
    problems.push(`time.zone "${raw.time.zone}" is not a known time zone`);
  }
  return problems;
}

function toSiteConfig(raw: RawSiteConfig) {
  return {
    brand: raw.brand,
    site: raw.site,
    languages: {
      default: raw.languages.default,
      supported: raw.languages.supported,
      messageCopy: raw.languages.message_copy,
      local: raw.languages.local,
    },
    money: raw.money,
    time: raw.time,
    contacts: raw.contacts,
    warehouse: raw.warehouse,
    owner: {
      name: raw.owner.name,
      address: raw.owner.address,
      registrationNumber: raw.owner.registration_number,
    },
    order: {
      minQuantity: raw.order.min_quantity,
      maxQuantity: raw.order.max_quantity,
      coordinateDecimals: raw.order.coordinate_decimals,
    },
    delivery: {
      sameDayUntil: raw.delivery.same_day_until,
      opensAt: raw.delivery.opens_at,
      closesAt: raw.delivery.closes_at,
      days: raw.delivery.days,
    },
    zone: raw.zone,
    trust: {
      sealedBottles: raw.trust.sealed_bottles,
      washedBottles: raw.trust.washed_bottles,
      officialDealer: raw.trust.official_dealer,
      photoBeforeDelivery: raw.trust.photo_before_delivery,
    },
    brands: raw.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      water: brand.water,
      volumeLiters: brand.volume_liters,
      price: brand.price,
      deposit: brand.deposit,
      tap: brand.tap,
      example: brand.example,
    })),
    pumps: raw.pumps,
    payments: raw.payments,
    messengers: raw.messengers,
    maps: {
      searchUrl: raw.maps.search_url,
    },
    geolocation: {
      timeoutMs: raw.geolocation.timeout_ms,
      maximumAgeMs: raw.geolocation.maximum_age_ms,
    },
    browserStorage: {
      languageKey: raw.browser_storage.language_key,
      lastOrderKey: raw.browser_storage.last_order_key,
    },
    analytics: {
      queueName: raw.analytics.queue_name,
    },
    design: {
      font: raw.design.font,
      shareImage: {
        fontPackage: raw.design.share_image.font_package,
        fontWeights: raw.design.share_image.font_weights,
        width: raw.design.share_image.width,
        height: raw.design.share_image.height,
      },
    },
  };
}

export type SiteConfig = ReturnType<typeof toSiteConfig>;
export type MessengerId = z.infer<typeof messengerId>;
export type TrustPoint = keyof SiteConfig['trust'];
export type ZoneArea = SiteConfig['zone'][number];

export class SiteConfigError extends Error {
  override readonly name = 'SiteConfigError';
}

export function parseSiteConfig(layered: unknown): SiteConfig {
  const parsed = rawSiteConfigSchema.safeParse(layered);
  if (!parsed.success) {
    throw new SiteConfigError(`Config is invalid:\n${z.prettifyError(parsed.error)}`);
  }
  const problems = findConsistencyProblems(parsed.data);
  if (problems.length > 0) {
    throw new SiteConfigError(`Config is inconsistent:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  }
  return toSiteConfig(parsed.data);
}
