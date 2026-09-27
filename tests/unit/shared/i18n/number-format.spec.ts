import { describe, expect, it } from 'vitest';
import { formatMoney, formatVolume } from '../../../../src/shared/i18n/number-format';

const NARROW_NO_BREAK_OR_NO_BREAK_SPACE = /[\u00A0\u202F]/g;

function withPlainSpaces(value: string): string {
  return value.replace(NARROW_NO_BREAK_OR_NO_BREAK_SPACE, ' ');
}

describe('formatMoney', () => {
  it.each([
    ['en', '₫50,000'],
    ['ru', '50 000 ₫'],
    ['vi', '50.000 ₫'],
  ])('formatMoney_inVnd_forLanguage_%s_gives_%s', (language, expected) => {
    expect(withPlainSpaces(formatMoney(50000, language, 'VND'))).toBe(expected);
  });
});

describe('formatVolume', () => {
  it.each([
    ['en', 21.5, '21.5'],
    ['ru', 21.5, '21,5'],
    ['vi', 21.5, '21,5'],
    ['en', 20, '20'],
  ])('formatVolume_forLanguage_%s_and_%s_liters_gives_%s', (language, liters, expected) => {
    expect(formatVolume(liters, language)).toBe(expected);
  });
});
