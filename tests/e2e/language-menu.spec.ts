import { artifactConfig, expect, test } from '../fixtures/site-test.ts';

const FLAG_IMAGE = /^data:image\/svg\+xml,/;

test.describe('language menu in the header', () => {
  test('shows the flag and code of the page language and lists every language with a flag and a code', async ({ page }) => {
    await page.goto('vi/');
    const menu = page.locator('.site-header .language-menu');
    const toggle = menu.locator('summary');

    await expect(toggle).toContainText('VI');
    await expect(toggle.locator('img')).toHaveAttribute('src', FLAG_IMAGE);
    await expect(toggle).toHaveAccessibleName('Tiếng Việt');

    await toggle.click();
    const options = menu.locator('a[data-language]');
    await expect(options).toHaveCount(artifactConfig.languages.supported.length);
    for (const option of await options.all()) {
      await expect(option.locator('img')).toHaveAttribute('src', FLAG_IMAGE);
      await expect(option).toContainText(/^[A-Z]{2}/);
    }
    await expect(menu.locator('a[aria-current="page"]')).toHaveAttribute('data-language', 'vi');
  });

  test('closes on Escape and on a click outside', async ({ page }) => {
    await page.goto('en/');
    const details = page.locator('.site-header .language-menu details');
    const toggle = details.locator('summary');

    await toggle.click();
    await expect(details).toHaveAttribute('open');
    await page.keyboard.press('Escape');
    await expect(details).not.toHaveAttribute('open');
    await expect(toggle).toBeFocused();

    await toggle.click();
    await expect(details).toHaveAttribute('open');
    await page.locator('h1').first().click();
    await expect(details).not.toHaveAttribute('open');
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('still opens and switches the language', async ({ page }) => {
      await page.goto('en/');

      await page.locator('.site-header .language-menu summary').click();
      await page.locator('.site-header .language-menu a[data-language="ru"]').click();
      await page.waitForURL(/\/ru\/$/);
    });
  });
});
