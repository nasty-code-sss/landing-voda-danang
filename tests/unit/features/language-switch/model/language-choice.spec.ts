import { describe, expect, it } from 'vitest';
import { isSupportedLanguage, preferredLanguage } from '../../../../../src/features/language-switch/model/language-choice';

const SUPPORTED = ['en', 'vi', 'ru'];

describe('preferredLanguage', () => {
  it('preferredLanguage_withRegionalRussian_picksRu', () => {
    expect(preferredLanguage(['ru-RU', 'en-US'], SUPPORTED)).toBe('ru');
  });

  it('preferredLanguage_skipsUnsupportedUntilMatch', () => {
    expect(preferredLanguage(['ko-KR', 'vi'], SUPPORTED)).toBe('vi');
  });

  it('preferredLanguage_withNothingSupported_returnsNull', () => {
    expect(preferredLanguage(['ko-KR', 'zh-CN'], SUPPORTED)).toBeNull();
  });
});

describe('isSupportedLanguage', () => {
  it.each([
    ['ru', true],
    ['ko', false],
    [null, false],
  ])('isSupportedLanguage_%s_is_%s', (value, expected) => {
    expect(isSupportedLanguage(value, SUPPORTED)).toBe(expected);
  });
});
