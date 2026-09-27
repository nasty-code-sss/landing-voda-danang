import { artifactConfig, builderValue, expect, firstMessenger, test } from '../fixtures/site-test.ts';

const QR_QUERY = '?mode=refill&brand=biwa&utm_source=qr';

test.describe('scenario 3: QR sticker with a remembered language', () => {
  test('root with QR query opens the remembered russian page in refill mode without deposit', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'ru'), artifactConfig.browserStorage.languageKey);

    await page.goto(`./${QR_QUERY}`);
    await page.waitForURL(/\/ru\//);

    const address = new URL(page.url());
    expect(address.pathname).toMatch(/\/ru\/$/);
    expect(address.search).toBe(QR_QUERY);
    expect(await builderValue(page, 'mode')).toBe('refill');
    await expect(page.locator('[data-total-row="deposit"]')).toBeHidden();
    expect(await firstMessenger(page)).toBe('telegram');
  });
});
