import { describe, expect, it } from 'vitest';
import { chatLink, opensMessengerApp, phoneCallLink } from '../../../../src/shared/api/messenger-link';

const WHATSAPP = { id: 'whatsapp', linkTemplate: 'https://wa.me/{contact}', contact: '84000000000' } as const;
const TELEGRAM = { id: 'telegram', linkTemplate: 'https://t.me/{contact}', contact: 'mywater_danang_demo' } as const;
const ZALO = { id: 'zalo', linkTemplate: 'https://zalo.me/{contact}', contact: '0000000000' } as const;
const KAKAOTALK = { id: 'kakaotalk', linkTemplate: 'https://pf.kakao.com/{contact}/chat', contact: '_mywaterdemo' } as const;
const WECHAT = { id: 'wechat', linkTemplate: null, contact: 'mywater_danang_demo' } as const;

describe('chatLink', () => {
  it('chatLink_forWhatsappWithText_encodesSpacesAndLineBreaksAsPercent', () => {
    expect(chatLink(WHATSAPP, 'Hi!\nBrand: Biwa & co')).toBe('https://wa.me/84000000000?text=Hi!%0ABrand%3A%20Biwa%20%26%20co');
  });

  it('chatLink_forTelegramWithText_addsTextParameter', () => {
    expect(chatLink(TELEGRAM, 'Total: ₫300,000')).toBe('https://t.me/mywater_danang_demo?text=Total%3A%20%E2%82%AB300%2C000');
  });

  it('chatLink_forZaloWithText_dropsTextBecauseZaloIgnoresIt', () => {
    expect(chatLink(ZALO, 'Order')).toBe('https://zalo.me/0000000000');
  });

  it('chatLink_forKakaoTalkWithText_opensChannelChatWithoutText', () => {
    expect(chatLink(KAKAOTALK, 'Order')).toBe('https://pf.kakao.com/_mywaterdemo/chat');
  });

  it('chatLink_forWeChat_pointsToContactCardOnThePage', () => {
    expect(chatLink(WECHAT, 'Order')).toBe('#wechat');
  });

  it('chatLink_withoutText_opensPlainChat', () => {
    expect(chatLink(WHATSAPP)).toBe('https://wa.me/84000000000');
  });
});

describe('opensMessengerApp', () => {
  it('opensMessengerApp_forMessengerWithChatLink_isTrue', () => {
    expect([WHATSAPP, TELEGRAM, ZALO, KAKAOTALK].every(opensMessengerApp)).toBe(true);
  });

  it('opensMessengerApp_forWeChatWithoutChatLink_isFalse', () => {
    expect(opensMessengerApp(WECHAT)).toBe(false);
  });
});

describe('phoneCallLink', () => {
  it('phoneCallLink_prefixesTelScheme', () => {
    expect(phoneCallLink('+84000000000')).toBe('tel:+84000000000');
  });
});
