import { artifactConfig, expect, firstMessenger, readClipboard, sendLink, test } from '../fixtures/site-test.ts';

const ADDRESS = 'Kiệt 12 An Thượng 4';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('scenario 20: WeChat', () => {
  test('wechat goes first in chinese, copies the order and shows the id and the qr code on the page', async ({ page }) => {
    await page.goto('zh/');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-address-input]').fill(ADDRESS);
    const card = page.locator('[data-contact-card]');

    expect(await firstMessenger(page)).toBe('wechat');
    await expect(card).toBeHidden();

    await sendLink(page, 'wechat').click();

    expect(page.context().pages()).toHaveLength(1);
    await expect(page).not.toHaveURL(/#wechat/);
    const order = await readClipboard(page);
    expect(order).toContain('Biwa');
    expect(order).toContain(ADDRESS);
    await expect(page.locator('[data-send-status]')).not.toBeEmpty();
    await expect(card).toBeVisible();
    await expect(card.locator('[data-wechat-id]')).toHaveText(artifactConfig.contacts.wechat);
    await expect(card.locator('.qr-code')).toBeVisible();

    await card.locator('[data-wechat-copy]').click();
    expect(await readClipboard(page)).toBe(artifactConfig.contacts.wechat);
    await expect(card.locator('[data-wechat-status]')).not.toBeEmpty();

    await card.locator('[data-copy-order]').click();
    await expect.poll(() => readClipboard(page)).toBe(order);
  });

  test('wechat without an address stays inactive and keeps the card closed', async ({ page }) => {
    await page.goto('zh/');
    await page.locator('input[name="brand"][value="biwa"]').check();

    await expect(sendLink(page, 'wechat')).toHaveAttribute('aria-disabled', 'true');
    await sendLink(page, 'wechat').click({ force: true });

    await expect(page.locator('[data-contact-card]')).toBeHidden();
    await expect(page.locator('[data-send-status]')).toBeEmpty();
    await expect(page).not.toHaveURL(/#wechat/);
  });

  test('landlord wechat link copies the message and leads to the id in the footer', async ({ page }) => {
    await page.goto('zh/');

    await page.locator('[data-landlord-link][data-analytics-param-messenger="wechat"]').click();

    expect(page.context().pages()).toHaveLength(1);
    await expect(page).toHaveURL(/#wechat$/);
    await expect(page.locator('#wechat [data-wechat-id]')).toHaveText(artifactConfig.contacts.wechat);
    await expect(page.locator('#wechat .qr-code')).toBeInViewport();
    expect(await readClipboard(page)).not.toBe('');
  });
});
