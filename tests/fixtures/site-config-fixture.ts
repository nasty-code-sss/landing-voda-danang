import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSiteConfig, type SiteConfig } from '../../src/shared/config/site-config';
import { parseDictionary, type Dictionaries } from '../../src/shared/i18n/dictionary';

export function rawConfigFixture() {
  return {
    brand: { name: 'Mỹ Water', slug: 'my-water' },
    site: { url: 'http://localhost:4321', base: '/landing-voda-danang', noindex: true, demo: true },
    languages: { default: 'en', supported: ['en', 'vi', 'ru'], message_copy: 'vi' },
    money: { currency: 'VND' },
    time: { zone: 'Asia/Ho_Chi_Minh' },
    contacts: { phone: '+84000000000', whatsapp: '84000000000', telegram: 'mywater_danang_demo', zalo: '0000000000' },
    order: { min_quantity: 3, max_quantity: 20, coordinate_decimals: 5 },
    delivery: { same_day_until: '14:00', opens_at: '08:00', closes_at: '18:00' },
    brands: [
      { id: 'biwa', name: 'Biwa', water: 'purified', volume_liters: 21.5, price: 50000, deposit: 50000, tap: false, example: true },
      { id: 'sunrise', name: 'Sunrise', water: 'purified', volume_liters: 20, price: 50000, deposit: 45000, tap: false, example: false },
      { id: 'lavie', name: 'La Vie', water: 'mineral', volume_liters: 18.5, price: 74000, deposit: 50000, tap: true, example: false },
    ],
    pumps: [{ id: 'usb', price: 130000 }],
    payments: ['cash', 'transfer'],
    messengers: {
      order: {
        en: ['whatsapp', 'telegram', 'zalo'],
        vi: ['zalo', 'whatsapp', 'telegram'],
        ru: ['telegram', 'whatsapp', 'zalo'],
      },
      links: { whatsapp: 'https://wa.me/', telegram: 'https://t.me/', zalo: 'https://zalo.me/' },
    },
    maps: { search_url: 'https://www.google.com/maps/search/?api=1&query=' },
    geolocation: { timeout_ms: 15000, maximum_age_ms: 60000 },
    browser_storage: { language_key: 'my-water.language' },
  };
}

export function configFixture(): SiteConfig {
  return parseSiteConfig(rawConfigFixture());
}

export function projectDictionaries(): Dictionaries {
  return Object.fromEntries(
    ['en', 'vi', 'ru'].map((language) => [
      language,
      parseDictionary(language, JSON.parse(readFileSync(join(process.cwd(), 'i18n', `${language}.json`), 'utf8'))),
    ]),
  );
}
