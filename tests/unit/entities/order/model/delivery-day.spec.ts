import { describe, expect, it } from 'vitest';
import { isSameDayDeliveryOpen } from '../../../../../src/entities/order/model/delivery-day';

const VIETNAM = 'Asia/Ho_Chi_Minh';

describe('isSameDayDeliveryOpen', () => {
  it('isSameDayDeliveryOpen_at16InVietnamWhileMoscowShows12_isClosed', () => {
    const vietnamFourPm = new Date('2026-09-27T09:00:00Z');

    expect(isSameDayDeliveryOpen(vietnamFourPm, '14:00', VIETNAM)).toBe(false);
  });

  it('isSameDayDeliveryOpen_at1359InVietnam_isOpen', () => {
    expect(isSameDayDeliveryOpen(new Date('2026-09-27T06:59:00Z'), '14:00', VIETNAM)).toBe(true);
  });

  it('isSameDayDeliveryOpen_exactlyAtCutoff_isClosed', () => {
    expect(isSameDayDeliveryOpen(new Date('2026-09-27T07:00:00Z'), '14:00', VIETNAM)).toBe(false);
  });

  it('isSameDayDeliveryOpen_justAfterMidnightInVietnam_isOpen', () => {
    expect(isSameDayDeliveryOpen(new Date('2026-09-27T17:30:00Z'), '14:00', VIETNAM)).toBe(true);
  });
});
