import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

const UNFILLED_PLACEHOLDER = /\{[a-z_]+\}/g;
const HTTP_OK = 200;
const PAGE_PATHS = ['./', ...artifactConfig.languages.supported.flatMap((language) => [`${language}/`, `${language}/legal/`])];
const SHARE_IMAGES = artifactConfig.languages.supported.map((language) => `${language}/og.png`);

test.use({ frozenTime: null });

test.describe('smoke: published site is up', () => {
  for (const path of PAGE_PATHS) {
    test(`${path} answers with visible text free of unfilled placeholders`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(HTTP_OK);
      await expect(page.locator('h1').first()).toBeVisible();
      expect((await page.locator('body').innerText()).match(UNFILLED_PLACEHOLDER)).toBeNull();
    });
  }

  test('share images and sitemap are served', async ({ request }) => {
    for (const path of SHARE_IMAGES) {
      const image = await request.get(path);
      expect(image.status(), path).toBe(HTTP_OK);
      expect(image.headers()['content-type'], path).toBe('image/png');
    }
    const sitemap = await request.get('sitemap.xml');
    expect(sitemap.status()).toBe(HTTP_OK);
    expect(await sitemap.text()).toContain(`${artifactConfig.site.url}${artifactConfig.site.base}/en/`);
  });
});
