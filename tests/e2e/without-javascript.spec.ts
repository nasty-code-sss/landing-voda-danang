import { artifactConfig, expect, sendLink, test } from '../fixtures/site-test.ts';

test.use({ javaScriptEnabled: false });

test.describe('scenario 17: without JavaScript', () => {
  test('texts, prices, contacts and plain messenger links are there and the builder asks for JavaScript', async ({ page }) => {
    await page.goto('en/');

    await expect(page.locator('.builder-noscript')).toBeVisible();
    await expect(page.locator('[data-builder-form]')).toBeHidden();
    await expect(sendLink(page, 'whatsapp')).toHaveAttribute('href', `https://wa.me/${artifactConfig.contacts.whatsapp}`);
    await expect(page.locator('.price-card-price')).toHaveCount(artifactConfig.brands.length);
    await expect(page.locator('.footer-contacts a[href^="tel:"]')).toBeVisible();
  });
});
