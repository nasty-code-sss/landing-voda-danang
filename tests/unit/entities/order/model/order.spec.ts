import { describe, expect, it } from 'vitest';
import type { Brand } from '../../../../../src/entities/brand/model/brand';
import {
  calculateTotal,
  clampQuantity,
  findMissingParts,
  isPumpOffered,
  type Order,
} from '../../../../../src/entities/order/model/order';

const BIWA: Brand = {
  id: 'biwa',
  name: 'Biwa',
  waterType: 'purified',
  volumeLiters: 21.5,
  price: 50000,
  deposit: 50000,
  hasTap: false,
  isExample: true,
};
const LA_VIE: Brand = { ...BIWA, id: 'lavie', name: 'La Vie', price: 74000, hasTap: true, isExample: false };
const USB_PUMP = { id: 'usb', price: 130000 };

function order(overrides: Partial<Order> = {}): Order {
  return {
    mode: 'first',
    brand: BIWA,
    quantity: 3,
    pump: null,
    deliveryPoint: { coordinates: null, address: 'Kiet 12 An Thuong 4' },
    day: 'today',
    payment: 'cash',
    ...overrides,
  };
}

describe('calculateTotal', () => {
  it('calculateTotal_firstOrderOfThreeBiwa_addsDepositForEachBottle', () => {
    expect(calculateTotal(order())).toEqual({ water: 150000, deposit: 150000, pump: 0, total: 300000 });
  });

  it('calculateTotal_refill_chargesWaterOnly', () => {
    expect(calculateTotal(order({ mode: 'refill' }))).toEqual({ water: 150000, deposit: 0, pump: 0, total: 150000 });
  });

  it('calculateTotal_firstOrderWithPump_addsPumpPrice', () => {
    expect(calculateTotal(order({ pump: USB_PUMP })).total).toBe(430000);
  });

  it('calculateTotal_pumpChosenForBottleWithTap_ignoresPump', () => {
    expect(calculateTotal(order({ brand: LA_VIE, pump: USB_PUMP })).pump).toBe(0);
  });

  it('calculateTotal_pumpChosenInRefill_ignoresPump', () => {
    expect(calculateTotal(order({ mode: 'refill', pump: USB_PUMP })).pump).toBe(0);
  });
});

describe('isPumpOffered', () => {
  it.each([
    ['first', BIWA, true],
    ['refill', BIWA, false],
    ['first', LA_VIE, false],
  ] as const)('isPumpOffered_%s_%o_is_%s', (mode, brand, expected) => {
    expect(isPumpOffered(mode, brand)).toBe(expected);
  });
});

describe('clampQuantity', () => {
  it.each([
    [1, 3],
    [3, 3],
    [7, 7],
    [99, 20],
    [4.7, 4],
  ])('clampQuantity_%d_gives_%d', (quantity, expected) => {
    expect(clampQuantity(quantity, { minimum: 3, maximum: 20 })).toBe(expected);
  });
});

describe('findMissingParts', () => {
  it('findMissingParts_withoutBrandAndPoint_reportsBoth', () => {
    expect(findMissingParts(null, { coordinates: null, address: '   ' })).toEqual(['brand', 'location']);
  });

  it('findMissingParts_withCoordinatesOnly_isComplete', () => {
    expect(findMissingParts(BIWA, { coordinates: { latitude: 16, longitude: 108 }, address: '' })).toEqual([]);
  });

  it('findMissingParts_withAddressOnly_isComplete', () => {
    expect(findMissingParts(BIWA, { coordinates: null, address: 'Kiet 12' })).toEqual([]);
  });
});
