import { artifactConfig, expect, readClipboard, sendLink, sendOrder, test } from '../fixtures/site-test.ts';

const ADDRESS = 'Kiệt 12 An Thượng 4';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('scenario 5: Zalo', () => {
  test('zalo button copies the order, shows the paste hint and opens the chat by phone', async ({ page }) => {
    await page.goto('vi/');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-address-input]').fill(ADDRESS);

    await expect(sendLink(page, 'zalo')).toHaveAttribute('href', `https://zalo.me/${artifactConfig.contacts.zalo}`);

    await sendOrder(page, 'zalo');

    const copied = await readClipboard(page);
    expect(copied).toContain('Biwa');
    expect(copied).toContain(ADDRESS);
    await expect(page.locator('[data-send-status]')).not.toBeEmpty();
  });
});
