import { builderValue, expect, sendOrder, test } from '../fixtures/site-test.ts';

const ADDRESS = 'Kiet 12 An Thuong 4, floor 3';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('scenario 10: repeat the last order', () => {
  test('sent order comes back as a refill with the same brand, quantity and address, forget removes it for good', async ({
    page,
  }) => {
    await page.goto('en/');
    await expect(page.locator('[data-repeat]')).toBeHidden();

    await page.locator('input[name="brand"][value="sunrise"]').check();
    await page.locator('[data-quantity-step="1"]').click();
    await page.locator('[data-address-input]').fill(ADDRESS);
    await sendOrder(page, 'whatsapp');

    await page.goto('en/');
    await expect(page.locator('[data-repeat-button]')).toBeVisible();
    await page.locator('[data-repeat-button]').click();

    expect(await builderValue(page, 'mode')).toBe('refill');
    expect(await builderValue(page, 'brand')).toBe('sunrise');
    await expect(page.locator('[data-quantity-value]')).toHaveText('4');
    await expect(page.locator('[data-address-input]')).toHaveValue(ADDRESS);
    await expect(page.locator('[data-total-row="deposit"]')).toBeHidden();

    await page.locator('[data-repeat-forget]').click();
    await expect(page.locator('[data-repeat-button]')).toBeHidden();
    await page.reload();
    await expect(page.locator('[data-repeat-button]')).toBeHidden();
  });
});
