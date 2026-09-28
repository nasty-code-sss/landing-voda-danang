import { artifactConfig, expect, firstMessenger, readClipboard, sendLink, sendOrder, test } from '../fixtures/site-test.ts';

const ADDRESS = 'Kiệt 12 An Thượng 4';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('scenario 19: KakaoTalk', () => {
  test('kakaotalk goes first in korean, copies the order and opens the chat of the channel', async ({ page }) => {
    await page.goto('ko/');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-address-input]').fill(ADDRESS);

    expect(await firstMessenger(page)).toBe('kakaotalk');
    await expect(sendLink(page, 'kakaotalk')).toHaveAttribute(
      'href',
      `https://pf.kakao.com/${artifactConfig.contacts.kakaotalk}/chat`,
    );

    await sendOrder(page, 'kakaotalk');

    const copied = await readClipboard(page);
    expect(copied).toContain('Biwa');
    expect(copied).toContain(ADDRESS);
    await expect(page.locator('[data-send-status]')).not.toBeEmpty();
  });
});
