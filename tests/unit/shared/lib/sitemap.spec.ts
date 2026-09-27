import { describe, expect, it } from 'vitest';
import { sitemapXml } from '../../../../src/shared/lib/sitemap';

describe('sitemapXml', () => {
  it('sitemapXml_withAlternates_writesXhtmlLinksPerUrl', () => {
    const xml = sitemapXml([
      {
        location: 'https://example.com/en/',
        alternates: [
          { hreflang: 'en', href: 'https://example.com/en/' },
          { hreflang: 'x-default', href: 'https://example.com/' },
        ],
      },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<loc>https://example.com/en/</loc>');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>');
  });

  it('sitemapXml_withAmpersandInUrl_escapesIt', () => {
    const xml = sitemapXml([{ location: 'https://example.com/?a=1&b=2', alternates: [] }]);

    expect(xml).toContain('<loc>https://example.com/?a=1&amp;b=2</loc>');
  });
});
