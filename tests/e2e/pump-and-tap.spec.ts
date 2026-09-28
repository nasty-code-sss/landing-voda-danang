import { expect, test } from '../fixtures/site-test.ts';

test.describe('scenario 11: pump and tap', () => {
  test('brand with a tap and refill mode both hide the pump field and the pump line of the total', async ({ page }) => {
    await page.goto('en/');

    await page.locator('input[name="brand"][value="lavie"]').check();
    await expect(page.locator('[data-pump-field]')).toBeHidden();
    await expect(page.locator('[data-total-row="pump"]')).toBeHidden();

    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('input[name="mode"][value="refill"]').check();
    await expect(page.locator('[data-pump-field]')).toBeHidden();
  });
});
