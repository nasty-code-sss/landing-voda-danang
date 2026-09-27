import type { APIRoute } from 'astro';
import { lowestPrice } from '../../entities/brand/model/brand';
import { brandsFromConfig } from '../../features/order-builder/model/builder-data';
import { loadShareFonts, renderSharePng } from '../../shared/api/share-image';
import { settings } from '../../shared/config/current-settings';
import { translator } from '../../shared/i18n/dictionary';
import { formatMoney } from '../../shared/i18n/number-format';
import { fillTemplate } from '../../shared/i18n/template';
import { shareCard } from '../../widgets/share-card/model/share-card';

const PNG_CONTENT_TYPE = 'image/png';

export function getStaticPaths() {
  return settings.config.languages.supported.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params }) => {
  const { config, dictionaries } = settings;
  const language = params.lang ?? config.languages.default;
  const say = translator(dictionaries, language);
  const { shareImage, font } = config.design;
  const size = { width: shareImage.width, height: shareImage.height };
  const fonts = loadShareFonts(process.cwd(), {
    packageName: shareImage.fontPackage,
    subsets: font.subsets,
    weights: shareImage.fontWeights,
  });
  const price = formatMoney(lowestPrice(brandsFromConfig(config)), language, config.money.currency);
  const card = shareCard({
    brand: config.brand.name,
    tagline: say('brand.tagline'),
    title: say('hero.title'),
    price: fillTemplate(say('share.price'), { price }),
    messengers: (config.messengers.order[language] ?? []).map((id) => say(`messenger.${id}`)),
    fontStack: fonts.stack,
    size,
  });
  const png = await renderSharePng(card, size, fonts);
  return new Response(png, { headers: { 'Content-Type': PNG_CONTENT_TYPE } });
};
