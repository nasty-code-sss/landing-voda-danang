import type { Page } from '@playwright/test';
import { artifactConfig, builderValue, expect, readClipboard, test, withPlainSpaces } from '../fixtures/site-test.ts';

const BUILDER_TOP_TOLERANCE_PX = 80;

type QueuedEvent = Readonly<Record<string, unknown>>;

async function queuedEvents(page: Page): Promise<QueuedEvent[]> {
  return page.evaluate(
    (queueName) => (window as unknown as Record<string, QueuedEvent[] | undefined>)[queueName] ?? [],
    artifactConfig.analytics.queueName,
  );
}

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('page blocks around the builder', () => {
  test('choose button on a price card picks the brand, scrolls to the builder and the order bar shows the total', async ({
    page,
  }) => {
    await page.goto('ru/');
    await expect(page.locator('[data-order-bar-total]')).toHaveText('');

    await page.locator('[data-choose-brand="lavie"]').click();

    expect(await builderValue(page, 'brand')).toBe('lavie');
    await expect
      .poll(async () => Math.abs(await page.locator('#order').evaluate((element) => element.getBoundingClientRect().top)))
      .toBeLessThan(BUILDER_TOP_TOLERANCE_PX);
    expect(new URL(page.url()).search).toBe('?brand=lavie');
    await expect.poll(async () => withPlainSpaces(await page.locator('[data-order-bar-total]').innerText())).toBe('372 000 ₫');

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('[data-order-bar]')).not.toHaveAttribute('data-covered');
  });

  test('opened questions report their numbers', async ({ page }) => {
    await page.goto('ru/');

    await page.locator('#faq details').nth(2).locator('summary').click();
    await page.locator('#faq details').nth(6).locator('summary').click();

    const opened = (await queuedEvents(page)).filter((event) => event.event === 'faq_open').map((event) => event.question);
    expect(opened).toEqual(['3', '7']);
  });

  test('first landlord link opens a chat prefilled in the page language and vietnamese, the same text is copied', async ({
    page,
  }) => {
    await page.goto('ru/');
    const link = page.locator('[data-landlord-link]').first();
    const prefilled = new URL((await link.getAttribute('href')) ?? '').searchParams.get('text') ?? '';

    expect(prefilled).toContain('сдаю квартиры');
    expect(prefilled).toContain('cho thuê căn hộ');

    const popup = page.context().waitForEvent('page');
    await link.click();
    await (await popup).close();

    expect(await readClipboard(page)).toBe(prefilled);
    expect((await queuedEvents(page)).find((event) => event.event === 'landlord_click')).toMatchObject({ messenger: 'telegram' });
  });

  test('order button on the first screen is tracked with its block', async ({ page }) => {
    await page.goto('ru/');

    await page.locator('.hero .button-primary').click();

    await expect
      .poll(async () => (await queuedEvents(page)).find((event) => event.event === 'cta_click'))
      .toMatchObject({ block: 'hero' });
  });

  test('language switch in the footer keeps the chosen brand', async ({ page }) => {
    await page.goto('ru/?brand=lavie');

    await page.locator('.site-footer .language-switch a[data-language="vi"]').click();
    await page.waitForURL(/\/vi\//);

    expect(new URL(page.url()).searchParams.get('brand')).toBe('lavie');
  });

  test('legal page has privacy, terms and complaints with the order limits filled in', async ({ page }) => {
    await page.goto('en/legal/#terms');

    const sections = await page.locator('main section').evaluateAll((elements) => elements.map((element) => element.id));
    expect(sections).toEqual(['privacy', 'terms', 'complaints']);
    const terms = withPlainSpaces(await page.locator('#terms').innerText());
    expect(terms).toContain(`${artifactConfig.order.minQuantity} bottles`);
    expect(terms).not.toContain('{');
  });
});
