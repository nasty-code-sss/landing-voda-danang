import { describe, expect, it } from 'vitest';
import { chatLink, phoneCallLink } from '../../../../src/shared/api/messenger-link';

const WHATSAPP = { id: 'whatsapp', baseUrl: 'https://wa.me/', contact: '84000000000' } as const;
const TELEGRAM = { id: 'telegram', baseUrl: 'https://t.me/', contact: 'mywater_danang_demo' } as const;
const ZALO = { id: 'zalo', baseUrl: 'https://zalo.me/', contact: '0000000000' } as const;

describe('chatLink', () => {
  it('chatLink_forWhatsappWithText_encodesSpacesAndLineBreaksAsPercent', () => {
    expect(chatLink(WHATSAPP, 'Hi!\nBrand: Biwa & co')).toBe(
      'https://wa.me/84000000000?text=Hi!%0ABrand%3A%20Biwa%20%26%20co',
    );
  });

  it('chatLink_forTelegramWithText_addsTextParameter', () => {
    expect(chatLink(TELEGRAM, 'Total: ₫300,000')).toBe(
      'https://t.me/mywater_danang_demo?text=Total%3A%20%E2%82%AB300%2C000',
    );
  });

  it('chatLink_forZaloWithText_dropsTextBecauseZaloIgnoresIt', () => {
    expect(chatLink(ZALO, 'Order')).toBe('https://zalo.me/0000000000');
  });

  it('chatLink_withoutText_opensPlainChat', () => {
    expect(chatLink(WHATSAPP)).toBe('https://wa.me/84000000000');
  });
});

describe('phoneCallLink', () => {
  it('phoneCallLink_prefixesTelScheme', () => {
    expect(phoneCallLink('+84000000000')).toBe('tel:+84000000000');
  });
});
