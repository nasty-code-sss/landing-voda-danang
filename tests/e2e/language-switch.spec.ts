import { builderValue, CYRILLIC_LETTER, expect, mainText, test } from '../fixtures/site-test.ts';

test.describe('scenario 2: switching language keeps the order', () => {
  test('russian page with Sunrise x 4 switched to English keeps brand and quantity without cyrillic text', async ({ page }) => {
    await page.goto('ru/');
    await page.locator('input[name="brand"][value="sunrise"]').check();
    await page.locator('[data-quantity-step="1"]').click();

    await page.locator('.site-header-row .language-switch a[data-language="en"]').filter({ visible: true }).click();
    await page.waitForURL(/\/en\//);

    expect(new URL(page.url()).pathname).toMatch(/\/en\/$/);
    expect(await builderValue(page, 'brand')).toBe('sunrise');
    await expect(page.locator('[data-quantity-value]')).toHaveText('4');
    expect(await mainText(page)).not.toMatch(CYRILLIC_LETTER);
  });
});
