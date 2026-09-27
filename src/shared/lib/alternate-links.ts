import { sitePath } from './site-path';
import { absoluteUrl, localizedPath, SITE_ROUTE, type SiteRoute } from './site-route';

export const DEFAULT_HREFLANG = 'x-default';

export interface AlternateLink {
  readonly hreflang: string;
  readonly href: string;
}

export interface LocalizedSite {
  readonly url: string;
  readonly base: string;
  readonly languages: readonly string[];
  readonly defaultLanguage: string;
}

function defaultPathOf(site: LocalizedSite, route: SiteRoute): string {
  return route === SITE_ROUTE.home ? sitePath(site.base) : localizedPath(site.base, site.defaultLanguage, route);
}

export function defaultUrl(site: LocalizedSite, route: SiteRoute): string {
  return absoluteUrl(site.url, defaultPathOf(site, route));
}

export function localizedUrl(site: LocalizedSite, language: string, route: SiteRoute): string {
  return absoluteUrl(site.url, localizedPath(site.base, language, route));
}

export function alternateLinks(site: LocalizedSite, route: SiteRoute): AlternateLink[] {
  return [
    ...site.languages.map((language) => ({ hreflang: language, href: localizedUrl(site, language, route) })),
    { hreflang: DEFAULT_HREFLANG, href: defaultUrl(site, route) },
  ];
}
