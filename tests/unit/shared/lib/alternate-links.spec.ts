import { describe, expect, it } from 'vitest';
import { alternateLinks, defaultUrl, localizedUrl } from '../../../../src/shared/lib/alternate-links';
import { SITE_ROUTE } from '../../../../src/shared/lib/site-route';

const site = {
  url: 'https://nasty-code-sss.github.io',
  base: '/landing-voda-danang',
  languages: ['en', 'vi', 'ru'],
  defaultLanguage: 'en',
};

describe('alternateLinks', () => {
  it('alternateLinks_forHome_listsEveryLanguageAndRootAsDefault', () => {
    expect(alternateLinks(site, SITE_ROUTE.home)).toEqual([
      { hreflang: 'en', href: 'https://nasty-code-sss.github.io/landing-voda-danang/en/' },
      { hreflang: 'vi', href: 'https://nasty-code-sss.github.io/landing-voda-danang/vi/' },
      { hreflang: 'ru', href: 'https://nasty-code-sss.github.io/landing-voda-danang/ru/' },
      { hreflang: 'x-default', href: 'https://nasty-code-sss.github.io/landing-voda-danang/' },
    ]);
  });

  it('alternateLinks_forLegal_pointsDefaultToDefaultLanguage', () => {
    const links = alternateLinks(site, SITE_ROUTE.legal);

    expect(links.at(-1)).toEqual({
      hreflang: 'x-default',
      href: 'https://nasty-code-sss.github.io/landing-voda-danang/en/legal/',
    });
    expect(links.map((link) => link.hreflang)).toEqual(['en', 'vi', 'ru', 'x-default']);
  });

  it('localizedUrl_andDefaultUrl_areAbsolute', () => {
    expect(localizedUrl(site, 'ru', SITE_ROUTE.legal)).toBe('https://nasty-code-sss.github.io/landing-voda-danang/ru/legal/');
    expect(defaultUrl(site, SITE_ROUTE.home)).toBe('https://nasty-code-sss.github.io/landing-voda-danang/');
  });
});
