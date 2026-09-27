import { describe, expect, it } from 'vitest';
import { analyticsPayload, isAnalyticsEventName } from '../../../../src/shared/lib/analytics-event';

describe('analyticsPayload', () => {
  it('analyticsPayload_fromQrSticker_addsLanguageAndSource', () => {
    const payload = analyticsPayload('builder_brand', { brand: 'biwa' }, {
      language: 'ru',
      query: new URLSearchParams('mode=refill&utm_source=qr'),
    });

    expect(payload).toEqual({ brand: 'biwa', event: 'builder_brand', language: 'ru', source: 'qr' });
  });

  it('analyticsPayload_withoutSource_setsSourceNull', () => {
    const payload = analyticsPayload('geo_ok', {}, { language: 'en', query: new URLSearchParams() });

    expect(payload.source).toBeNull();
  });

  it('analyticsPayload_withParamNamedEvent_keepsRealEventName', () => {
    const payload = analyticsPayload('cta_click', { event: 'spoofed' }, { language: 'en', query: new URLSearchParams() });

    expect(payload.event).toBe('cta_click');
  });
});

describe('isAnalyticsEventName', () => {
  it.each([
    ['send_click', true],
    ['faq_open', true],
    ['purchase', false],
    [undefined, false],
  ])('isAnalyticsEventName_%s_is_%s', (value, expected) => {
    expect(isAnalyticsEventName(value)).toBe(expected);
  });
});
