import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

test.describe('scenario 9: site root follows the browser language', () => {
  test.describe('russian browser', () => {
    test.use({ locale: 'ru-RU' });

    test('first visit opens /ru/ right away, a language chosen in the menu wins next time', async ({ page }) => {
      await page.goto('./');
      await page.waitForURL(/\/ru\/$/);

      await page.locator('.site-header .language-menu summary').click();
      await page.locator('.site-header .language-menu a[data-language="vi"]').click();
      await page.waitForURL(/\/vi\//);

      await page.goto('./');
      await page.waitForURL(/\/vi\/$/);
    });

    test('language list never shows while the redirect script is still loading', async ({ page }) => {
      let releaseScripts: () => void = () => undefined;
      const scriptsHeld = new Promise<void>((resolve) => {
        releaseScripts = resolve;
      });
      await page.route('**/_astro/*.js', async (route) => {
        await scriptsHeld;
        await route.continue();
      });
      const picker = page.locator('[data-language-picker]');

      await page.goto('./', { waitUntil: 'commit' });
      await expect(picker).toBeAttached();
      await expect(picker).toBeHidden();

      releaseScripts();
      await page.waitForURL(/\/ru\/$/);
    });
  });

  for (const { locale, language } of [
    { locale: 'ko-KR', language: 'ko' },
    { locale: 'zh-CN', language: 'zh' },
  ]) {
    test.describe(`${locale} browser`, () => {
      test.use({ locale });

      test(`first visit opens /${language}/`, async ({ page }) => {
        await page.goto('./');
        await page.waitForURL(new RegExp(`/${language}/$`));
      });
    });
  }

  test.describe('browser language the site does not have', () => {
    test.use({ locale: 'de-DE' });

    test('first visit opens the default language', async ({ page }) => {
      await page.goto('./');
      await page.waitForURL(new RegExp(`/${artifactConfig.languages.default}/$`));
    });
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('root falls back to plain language links', async ({ page }) => {
      await page.goto('./');

      const links = page.locator('[data-language-option]');
      await expect(links).toHaveCount(artifactConfig.languages.supported.length);
      await links.filter({ hasText: 'Русский' }).click();
      await page.waitForURL(/\/ru\/$/);
    });
  });
});
