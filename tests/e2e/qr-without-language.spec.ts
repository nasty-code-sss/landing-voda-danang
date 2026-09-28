import { expect, test } from '../fixtures/site-test.ts';

const QR_QUERY = '?mode=refill&brand=biwa&utm_source=qr';

test.describe('scenario 4: QR sticker in a clean browser', () => {
  test.use({ locale: 'ru-RU' });

  test('root with QR query opens the browser language with the query, no language picker', async ({ page }) => {
    await page.goto(`./${QR_QUERY}`);
    await page.waitForURL(/\/ru\//);

    const address = new URL(page.url());
    expect(address.pathname).toMatch(/\/ru\/$/);
    expect(address.search).toBe(QR_QUERY);
    await expect(page.locator('[data-language-picker]')).toHaveCount(0);
  });
});
