import type { APIRoute } from 'astro';
import { localizedSite } from '../app/layouts/page-meta';
import { settings } from '../shared/config/current-settings';
import { alternateLinks, defaultUrl, localizedUrl } from '../shared/lib/alternate-links';
import { SITE_ROUTE } from '../shared/lib/site-route';
import { sitemapXml, type SitemapEntry } from '../shared/lib/sitemap';

const SITEMAP_CONTENT_TYPE = 'application/xml; charset=utf-8';

function sitemapEntries(): SitemapEntry[] {
  const site = localizedSite(settings);
  return Object.values(SITE_ROUTE).flatMap((route) => {
    const alternates = alternateLinks(site, route);
    const languageEntries = site.languages.map((language) => ({ location: localizedUrl(site, language, route), alternates }));
    const defaultEntry = { location: defaultUrl(site, route), alternates };
    const isOwnPage = !languageEntries.some((entry) => entry.location === defaultEntry.location);
    return isOwnPage ? [defaultEntry, ...languageEntries] : languageEntries;
  });
}

export const GET: APIRoute = () =>
  new Response(sitemapXml(sitemapEntries()), { headers: { 'Content-Type': SITEMAP_CONTENT_TYPE } });
