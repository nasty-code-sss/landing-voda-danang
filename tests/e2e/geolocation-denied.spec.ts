import { expect, sendLink, test } from '../fixtures/site-test.ts';

test.use({ permissions: [] });

test.describe('scenario 7: geolocation denied', () => {
  test('denied location moves focus to the address field and a typed address unlocks sending', async ({ page }) => {
    await page.goto('en/');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-geo-button]').click();

    await expect(page.locator('[data-geo-status]')).toContainText("Couldn't");
    await expect(page.locator('[data-address-input]')).toBeFocused();

    await page.locator('[data-address-input]').fill('Kiet 12 An Thuong 4');

    await expect(sendLink(page, 'whatsapp')).toHaveAttribute('aria-disabled', 'false');
  });
});
