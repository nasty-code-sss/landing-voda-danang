import { builderValue, expect, test } from '../fixtures/site-test.ts';

test.describe('scenario 12: unknown brand in the address', () => {
  test('page with brand=aquafina works with no brand chosen and no console errors', async ({ page }) => {
    await page.goto('en/?brand=aquafina');

    await expect(page.locator('[data-builder-form]')).toBeVisible();
    expect(await builderValue(page, 'brand')).toBeNull();
  });
});
