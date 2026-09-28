import {
  DEVICE_POINT,
  expect,
  firstMessenger,
  messageOf,
  readClipboard,
  sendLink,
  sendOrder,
  test,
  waitUntilSendable,
} from '../fixtures/site-test.ts';

test.use({ permissions: ['geolocation', 'clipboard-read', 'clipboard-write'], geolocation: DEVICE_POINT });

test.describe('scenario 1: first order in English via WhatsApp', () => {
  test('whatsapp link carries brand, total, map point and vietnamese copy, clipboard holds the same order', async ({ page }) => {
    await page.goto('en/');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-geo-button]').click();
    await waitUntilSendable(page);

    const href = (await sendLink(page, 'whatsapp').getAttribute('href')) ?? '';
    const message = messageOf(href);

    expect(await firstMessenger(page)).toBe('whatsapp');
    expect(href).toMatch(/^https:\/\/wa\.me\/84\d+\?text=/);
    expect(message).toContain('Brand: Biwa');
    expect(message).toContain('x 3');
    expect(message).toContain('Total: ₫300,000');
    expect(message).toContain('query=16.05412%2C108.24731');
    expect(message).toContain('Tổng: 300.000 ₫');

    await sendOrder(page, 'whatsapp');

    expect(await readClipboard(page)).toBe(new URL(href).searchParams.get('text'));
  });
});
