import { expect, sendLink, test } from '../fixtures/site-test.ts';

test.describe('scenario 6: no location and no address', () => {
  test('send buttons stay disabled, the hint names the missing address and nothing opens', async ({ page, context }) => {
    await page.goto('en/');
    await page.locator('input[name="brand"][value="biwa"]').check();

    const links = page.locator('[data-send-link]');
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('aria-disabled', 'true');
    }
    await expect(page.locator('[data-missing-list] li')).toHaveCount(1);

    const pagesBefore = context.pages().length;
    await sendLink(page, 'whatsapp').click({ force: true });

    expect(context.pages()).toHaveLength(pagesBefore);
    expect(new URL(page.url()).pathname).toMatch(/\/en\/$/);
  });
});
