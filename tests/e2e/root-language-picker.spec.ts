import { expect, test } from '../fixtures/site-test.ts';

test.use({ locale: 'ru-RU' });

test.describe('scenario 9: site root', () => {
  test('first visit highlights russian without redirect, after choosing it the root opens /ru/', async ({ page, baseURL }) => {
    await page.goto('./');
    await expect(page.locator('[data-language-picker]')).not.toHaveAttribute('data-pending');

    await expect(page.locator('[data-language-option][data-preferred]')).toHaveAttribute('data-language', 'ru');
    expect(page.url()).toBe(baseURL);

    await page.locator('[data-language-option][data-language="ru"]').click();
    await page.waitForURL(/\/ru\//);

    await page.goto('./');
    await page.waitForURL(/\/ru\//);
  });
});
