import { artifactConfig, DEVICE_POINT, expect, sendOrder, test, waitUntilSendable } from '../fixtures/site-test.ts';

test.use({ permissions: ['geolocation', 'clipboard-read', 'clipboard-write'], geolocation: DEVICE_POINT });

test.describe('scenario 18: analytics events', () => {
  test('scenario 1 from a QR sticker queues the builder events in order with their parameters', async ({ page }) => {
    await page.goto('en/?utm_source=qr');
    await page.locator('input[name="brand"][value="biwa"]').check();
    await page.locator('[data-geo-button]').click();
    await waitUntilSendable(page);
    await sendOrder(page, 'whatsapp');

    const events = await page.evaluate(
      (queueName) => (window as unknown as Record<string, Record<string, unknown>[] | undefined>)[queueName] ?? [],
      artifactConfig.analytics.queueName,
    );

    expect(events.map((event) => event.event)).toEqual(['builder_start', 'builder_brand', 'geo_request', 'geo_ok', 'send_click']);
    expect(events[0]).toMatchObject({ mode: 'first' });
    expect(events[1]).toMatchObject({ brand: 'biwa' });
    expect(events[4]).toMatchObject({ messenger: 'whatsapp', brand: 'biwa', quantity: 3, mode: 'first', total: 300000 });
    for (const event of events) {
      expect(event).toMatchObject({ language: 'en', source: 'qr' });
    }
  });
});
