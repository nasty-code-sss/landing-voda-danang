import { describe, expect, it } from 'vitest';
import { createBuilderData } from '../../../../../src/features/order-builder/model/builder-data';
import { readBuilderState } from '../../../../../src/features/order-builder/model/builder-state';
import {
  describeLastOrder,
  lastOrderOf,
  parseLastOrder,
  repeatLastOrder,
  serializeLastOrder,
} from '../../../../../src/features/order-builder/model/last-order';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

const data = createBuilderData(configFixture(), projectDictionaries(), 'en');
const blank = readBuilderState(new URLSearchParams(), data);
const sent = {
  ...blank,
  brandId: 'sunrise',
  quantity: 4,
  pumpId: 'usb',
  coordinates: { latitude: 16.05412, longitude: 108.24731 },
  address: '  Kiet 12 An Thuong 4, floor 3 ',
  payment: 'transfer' as const,
};

describe('last order', () => {
  it('serializeLastOrder_thenParse_restoresOrderWithTrimmedAddress', () => {
    const order = lastOrderOf(sent);

    expect(order).not.toBeNull();
    expect(parseLastOrder(serializeLastOrder(order ?? never()), data)).toEqual({
      brandId: 'sunrise',
      quantity: 4,
      coordinates: { latitude: 16.05412, longitude: 108.24731 },
      address: 'Kiet 12 An Thuong 4, floor 3',
      payment: 'transfer',
    });
  });

  it('lastOrderOf_withoutBrand_isNull', () => {
    expect(lastOrderOf(blank)).toBeNull();
  });

  it.each([
    ['nothing stored', null],
    ['broken json', '{"format":1,'],
    ['other format', JSON.stringify({ format: 2, brandId: 'biwa', quantity: 3, address: 'x' })],
    ['brand removed from price list', JSON.stringify({ format: 1, brandId: 'aquafina', quantity: 3, address: 'x' })],
    ['no delivery point', JSON.stringify({ format: 1, brandId: 'biwa', quantity: 3, address: '  ' })],
    ['quantity is text', JSON.stringify({ format: 1, brandId: 'biwa', quantity: 'three', address: 'x' })],
  ])('parseLastOrder_with_%s_returnsNull', (_case, raw) => {
    expect(parseLastOrder(raw, data)).toBeNull();
  });

  it('parseLastOrder_withOutOfRangeValues_clampsQuantityAndDropsBadCoordinates', () => {
    const raw = JSON.stringify({
      format: 1,
      brandId: 'biwa',
      quantity: 99,
      coordinates: { latitude: 200, longitude: 108 },
      address: 'Kiet 5',
      payment: 'bitcoin',
    });

    expect(parseLastOrder(raw, data)).toMatchObject({ quantity: 20, coordinates: null, payment: 'cash' });
  });

  it('repeatLastOrder_switchesToRefillAndDropsPump', () => {
    const order = lastOrderOf(sent) ?? never();
    const repeated = repeatLastOrder({ ...blank, mode: 'first', pumpId: 'usb' }, order);

    expect(repeated).toMatchObject({ mode: 'refill', brandId: 'sunrise', quantity: 4, pumpId: null, payment: 'transfer' });
    expect(repeated.address).toBe('Kiet 12 An Thuong 4, floor 3');
  });

  it('describeLastOrder_namesBrandVolumeAndBottles', () => {
    expect(describeLastOrder(lastOrderOf(sent) ?? never(), data)).toBe('Sunrise 20 L, 4 bottles');
  });
});

function never(): never {
  throw new Error('Expected a value');
}
