import { describe, expect, it } from 'vitest';
import {
  isSupportedLanguage,
  languageToOpen,
  preferredLanguage,
} from '../../../../../src/features/language-switch/model/language-choice';

const SUPPORTED = ['en', 'vi', 'ru'];
const FALLBACK = 'en';

describe('languageToOpen', () => {
  it('languageToOpen_withRememberedChoice_prefersItOverBrowser', () => {
    expect(languageToOpen({ remembered: 'vi', browserLanguages: ['ru-RU'], supported: SUPPORTED, fallback: FALLBACK })).toBe(
      'vi',
    );
  });

  it('languageToOpen_withoutRememberedChoice_followsBrowser', () => {
    expect(
      languageToOpen({ remembered: null, browserLanguages: ['ru-RU', 'en-US'], supported: SUPPORTED, fallback: FALLBACK }),
    ).toBe('ru');
  });

  it('languageToOpen_withUnsupportedRememberedChoice_followsBrowser', () => {
    expect(languageToOpen({ remembered: 'ko', browserLanguages: ['vi-VN'], supported: SUPPORTED, fallback: FALLBACK })).toBe(
      'vi',
    );
  });

  it('languageToOpen_withNothingSupported_opensFallback', () => {
    expect(
      languageToOpen({ remembered: null, browserLanguages: ['de-DE', 'ko-KR'], supported: SUPPORTED, fallback: FALLBACK }),
    ).toBe(FALLBACK);
  });
});

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
