import type { Page } from '@playwright/test';
import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

const HOME_PAGES = ['./', 'en/', 'vi/', 'ru/'];
const LEGAL_PAGES = ['en/legal/', 'vi/legal/', 'ru/legal/'];
const DEFAULT_ALTERNATE = 'x-default';

interface Alternate {
  readonly code: string;
  readonly href: string;
}

function byCode(left: Alternate, right: Alternate): number {
  return left.code.localeCompare(right.code);
}

async function alternatesOf(page: Page, path: string): Promise<Alternate[]> {
  await page.goto(path);
  const alternates = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((elements) =>
      elements.map((element) => ({ code: element.getAttribute('hreflang') ?? '', href: element.getAttribute('href') ?? '' })),
    );
  return alternates.sort(byCode);
}

test.describe('scenario 15: reciprocal hreflang', () => {
  for (const group of [HOME_PAGES, LEGAL_PAGES]) {
    test(`${group.join(' ')} list every language and x-default by the same full addresses of the published site`, async ({
      page,
    }) => {
      const siteAddress = `${artifactConfig.site.url}${artifactConfig.site.base}/`;
      const expectedCodes = [...artifactConfig.languages.supported, DEFAULT_ALTERNATE].sort();
      const sets: Alternate[][] = [];
      for (const path of group) {
        sets.push(await alternatesOf(page, path));
      }
      const [first, ...others] = sets;

      expect(first?.map((alternate) => alternate.code)).toEqual(expectedCodes);
      for (const alternate of first ?? []) {
        expect(alternate.href.slice(0, siteAddress.length)).toBe(siteAddress);
      }
      for (const other of others) {
        expect(other).toEqual(first);
      }
    });
  }
});
