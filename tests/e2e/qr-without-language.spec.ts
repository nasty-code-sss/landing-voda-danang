import { expect, test } from '../fixtures/site-test.ts';

const QR_QUERY = '?mode=refill&brand=biwa&utm_source=qr';

test.describe('scenario 4: QR sticker in a clean browser', () => {
  test('root with QR query shows the language picker and English keeps the query', async ({ page }) => {
    await page.goto(`./${QR_QUERY}`);
    await expect(page.locator('[data-language-picker]')).not.toHaveAttribute('data-pending');

    await page.locator('[data-language-option][data-language="en"]').click();
    await page.waitForURL(/\/en\//);

    const address = new URL(page.url());
    expect(address.pathname).toMatch(/\/en\/$/);
    expect(address.search).toBe(QR_QUERY);
  });
});
