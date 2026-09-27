import { describe, expect, it } from 'vitest';
import type { Order } from '../../../../../src/entities/order/model/order';
import { composeOrderMessage } from '../../../../../src/entities/order/model/order-message';
import { createBuilderData } from '../../../../../src/features/order-builder/model/builder-data';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

const NO_BREAK_SPACES = /[\u00A0\u202F]/g;
const LOCATION = 'https://www.google.com/maps/search/?api=1&query=16.05412%2C108.24731';

const english = createBuilderData(configFixture(), projectDictionaries(), 'en');
const vietnamese = createBuilderData(configFixture(), projectDictionaries(), 'vi');
const biwa = english.brands.find((brand) => brand.id === 'biwa');
if (biwa === undefined) {
  throw new Error('Fixture has no Biwa');
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    mode: 'first',
    brand: biwa!,
    quantity: 3,
    pump: { id: 'usb', price: 130000 },
    deliveryPoint: { coordinates: { latitude: 16.05412, longitude: 108.24731 }, address: 'Kiet 12 An Thuong 4, floor 3' },
    day: 'today',
    payment: 'cash',
    ...overrides,
  };
}

function plain(message: string): string {
  return message.replace(NO_BREAK_SPACES, ' ');
}

describe('composeOrderMessage', () => {
  it('composeOrderMessage_inEnglish_matchesTzExampleAndAddsVietnameseCopy', () => {
    const message = composeOrderMessage({
      order: order(),
      locationLink: LOCATION,
      currency: 'VND',
      primary: english.message,
      copy: english.messageCopy,
    });

    expect(plain(message)).toBe(
      [
        'Hi! Order from the website:',
        'Brand: Biwa 21.5 L x 3',
        'Type: first order (with bottle deposit)',
        'Pump: USB electric pump',
        `Location: ${LOCATION}`,
        'Address: Kiet 12 An Thuong 4, floor 3',
        'When: today',
        'Payment: cash',
        'Total: ₫430,000 (water ₫150,000 + deposit ₫150,000 + pump ₫130,000)',
        '',
        '---',
        'Đơn hàng từ website:',
        'Nhãn hiệu: Biwa 21,5 L x 3',
        'Loại: đơn đầu tiên (có đặt cọc vỏ bình)',
        'Máy bơm: Máy bơm điện sạc USB',
        `Vị trí: ${LOCATION}`,
        'Địa chỉ: Kiet 12 An Thuong 4, floor 3',
        'Thời gian: hôm nay',
        'Thanh toán: tiền mặt',
        'Tổng: 430.000 ₫ (nước 150.000 ₫ + cọc vỏ 150.000 ₫ + máy bơm 130.000 ₫)',
      ].join('\n'),
    );
  });

  it('composeOrderMessage_inVietnamese_hasNoSecondCopy', () => {
    const message = composeOrderMessage({
      order: order({ mode: 'refill', pump: null, deliveryPoint: { coordinates: null, address: 'Kiệt 12' } }),
      locationLink: null,
      currency: 'VND',
      primary: vietnamese.message,
      copy: vietnamese.messageCopy,
    });

    expect(vietnamese.messageCopy).toBeNull();
    expect(message).not.toContain('---');
    expect(plain(message)).toContain('Loại: đổi vỏ bình');
    expect(plain(message)).toContain('Tổng: 150.000 ₫');
    expect(message).not.toContain('(');
  });

  it('composeOrderMessage_withoutLocationAndAddress_omitsBothLines', () => {
    const message = composeOrderMessage({
      order: order({ deliveryPoint: { coordinates: null, address: '  ' } }),
      locationLink: null,
      currency: 'VND',
      primary: english.message,
      copy: null,
    });

    expect(message).not.toContain('Location:');
    expect(message).not.toContain('Address:');
  });

  it('composeOrderMessage_forBrandWithTap_omitsPumpLine', () => {
    const laVie = english.brands.find((brand) => brand.id === 'lavie');
    const message = composeOrderMessage({
      order: order({ brand: laVie! }),
      locationLink: LOCATION,
      currency: 'VND',
      primary: english.message,
      copy: null,
    });

    expect(message).not.toContain('Pump:');
    expect(plain(message)).toContain('Total: ₫372,000 (water ₫222,000 + deposit ₫150,000)');
  });
});
