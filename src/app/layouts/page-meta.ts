import type { Settings } from '../../shared/config/settings';
import { dictionaryFor, text } from '../../shared/i18n/dictionary';
import { fillTemplate } from '../../shared/i18n/template';
import {
  alternateLinks,
  defaultUrl,
  localizedUrl,
  type AlternateLink,
  type LocalizedSite,
} from '../../shared/lib/alternate-links';
import { absoluteUrl, localizedPath, SITE_ROUTE, type SiteRoute } from '../../shared/lib/site-route';

export const SHARE_IMAGE_FILE = 'og.png';

export interface PageMeta {
  readonly language: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly alternates: readonly AlternateLink[];
  readonly shareImage: string;
  readonly shareImageAlt: string;
  readonly ogLocale: string;
  readonly siteName: string;
  readonly noindex: boolean;
  readonly analyticsQueue: string;
}

const ROUTE_META_KEYS: Readonly<Record<SiteRoute, { readonly title: string; readonly description: string }>> = {
  [SITE_ROUTE.home]: { title: 'meta.title', description: 'meta.description' },
  [SITE_ROUTE.legal]: { title: 'legal.meta.title', description: 'legal.meta.description' },
};

export function localizedSite(settings: Settings): LocalizedSite {
  const { site, languages } = settings.config;
  return { url: site.url, base: site.base, languages: languages.supported, defaultLanguage: languages.default };
}

export function shareImageUrl(settings: Settings, language: string): string {
  const { site } = settings.config;
  return absoluteUrl(site.url, `${localizedPath(site.base, language, SITE_ROUTE.home)}${SHARE_IMAGE_FILE}`);
}

export function pageMeta(settings: Settings, language: string, route: SiteRoute, isDefaultPage = false): PageMeta {
  const { config, dictionaries } = settings;
  const dictionary = dictionaryFor(dictionaries, language);
  const say = (key: string) => text(dictionary, key);
  const site = localizedSite(settings);
  const keys = ROUTE_META_KEYS[route];
  return {
    language,
    title: fillTemplate(say(keys.title), { brand: config.brand.name }),
    description: say(keys.description),
    canonical: isDefaultPage ? defaultUrl(site, route) : localizedUrl(site, language, route),
    alternates: alternateLinks(site, route),
    shareImage: shareImageUrl(settings, language),
    shareImageAlt: say('meta.share_image_alt'),
    ogLocale: say('meta.og_locale'),
    siteName: config.brand.name,
    noindex: config.site.noindex,
    analyticsQueue: config.analytics.queueName,
  };
}
