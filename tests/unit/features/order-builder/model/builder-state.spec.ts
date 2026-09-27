import { describe, expect, it } from 'vitest';
import { createBuilderData } from '../../../../../src/features/order-builder/model/builder-data';
import {
  applyDeliveryCutoff,
  readBuilderState,
  writeBuilderQuery,
} from '../../../../../src/features/order-builder/model/builder-state';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

const data = createBuilderData(configFixture(), projectDictionaries(), 'en');
const VIETNAM_NOON = new Date('2026-09-27T05:00:00Z');
const VIETNAM_FOUR_PM = new Date('2026-09-27T09:00:00Z');

describe('readBuilderState', () => {
  it('readBuilderState_fromQrSticker_setsRefillAndBrand', () => {
    const state = readBuilderState(new URLSearchParams('mode=refill&brand=biwa&utm_source=qr'), data);

    expect(state).toMatchObject({ mode: 'refill', brandId: 'biwa', quantity: 3, day: 'today', payment: 'cash' });
  });

  it('readBuilderState_withUnknownBrand_leavesBrandEmpty', () => {
    expect(readBuilderState(new URLSearchParams('brand=aquafina'), data).brandId).toBeNull();
  });

  it('readBuilderState_withQuantityBelowMinimum_clampsToMinimum', () => {
    expect(readBuilderState(new URLSearchParams('qty=1'), data).quantity).toBe(3);
  });

  it('readBuilderState_withGarbageQuantity_usesMinimum', () => {
    expect(readBuilderState(new URLSearchParams('qty=lots'), data).quantity).toBe(3);
  });

  it('readBuilderState_withUnknownPumpAndPayment_fallsBackToDefaults', () => {
    const state = readBuilderState(new URLSearchParams('pump=manual&pay=bitcoin'), data);

    expect(state.pumpId).toBeNull();
    expect(state.payment).toBe('cash');
  });
});

describe('writeBuilderQuery', () => {
  it('writeBuilderQuery_keepsForeignParametersAndDropsDefaults', () => {
    const state = readBuilderState(new URLSearchParams('mode=refill&brand=biwa&utm_source=qr'), data);
    const query = writeBuilderQuery(
      { ...state, mode: 'first', quantity: 4 },
      data,
      new URLSearchParams('utm_source=qr&mode=refill'),
    );

    expect(query.toString()).toBe('utm_source=qr&brand=biwa&qty=4');
  });

  it('writeBuilderQuery_thenReadBuilderState_roundTripsSelection', () => {
    const selected = {
      ...readBuilderState(new URLSearchParams(), data),
      mode: 'refill' as const,
      brandId: 'sunrise',
      quantity: 4,
      pumpId: 'usb',
      day: 'tomorrow' as const,
      payment: 'transfer' as const,
    };

    const restored = readBuilderState(writeBuilderQuery(selected, data, new URLSearchParams()), data);

    expect(restored).toEqual(selected);
  });
});

describe('applyDeliveryCutoff', () => {
  it('applyDeliveryCutoff_afterCutoffInVietnam_movesTodayToTomorrow', () => {
    const state = readBuilderState(new URLSearchParams(), data);

    expect(applyDeliveryCutoff(state, data, VIETNAM_FOUR_PM).day).toBe('tomorrow');
  });

  it('applyDeliveryCutoff_beforeCutoff_keepsToday', () => {
    const state = readBuilderState(new URLSearchParams(), data);

    expect(applyDeliveryCutoff(state, data, VIETNAM_NOON).day).toBe('today');
  });
});
