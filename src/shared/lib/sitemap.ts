import type { AlternateLink } from './alternate-links';

export interface SitemapEntry {
  readonly location: string;
  readonly alternates: readonly AlternateLink[];
}

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};
const XML_SPECIAL_CHARACTERS = /[&<>"']/g;
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

function escapeXml(value: string): string {
  return value.replace(XML_SPECIAL_CHARACTERS, (character) => XML_ESCAPES[character] ?? character);
}

function alternateElement(alternate: AlternateLink): string {
  return `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}"/>`;
}

function urlElement(entry: SitemapEntry): string {
  return ['  <url>', `    <loc>${escapeXml(entry.location)}</loc>`, ...entry.alternates.map(alternateElement), '  </url>'].join(
    '\n',
  );
}

export function sitemapXml(entries: readonly SitemapEntry[]): string {
  return [
    XML_DECLARATION,
    `<urlset xmlns="${SITEMAP_NAMESPACE}" xmlns:xhtml="${XHTML_NAMESPACE}">`,
    ...entries.map(urlElement),
    '</urlset>',
    '',
  ].join('\n');
}
