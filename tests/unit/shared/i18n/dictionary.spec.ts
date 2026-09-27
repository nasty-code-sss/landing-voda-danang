import { describe, expect, it } from 'vitest';
import {
  assertDictionariesComplete,
  DictionaryError,
  findDictionaryProblems,
  parseDictionary,
  text,
} from '../../../../src/shared/i18n/dictionary';
import { fillTemplate } from '../../../../src/shared/i18n/template';
import { projectDictionaries } from '../../../fixtures/site-config-fixture';

const CYRILLIC = /[\u0400-\u04FF]/;
const VIETNAMESE_LETTER =
  /[ăâđêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
const VIETNAMESE_WORDS_ALLOWED_IN_RUSSIAN = new Set(['address.lane_word']);

describe('findDictionaryProblems', () => {
  it('findDictionaryProblems_withKeyMissingInOneLanguage_namesKeyAndLanguage', () => {
    const problems = findDictionaryProblems({
      en: { 'a.title': 'Title', 'a.hint': 'Hint' },
      ru: { 'a.title': 'Заголовок' },
    });

    expect(problems).toEqual(['"a.hint" is missing in ru']);
  });

  it('findDictionaryProblems_withDifferentPlaceholders_reportsKey', () => {
    const problems = findDictionaryProblems({
      en: { price: '{amount} per bottle' },
      ru: { price: '{sum} за бутыль' },
    });

    expect(problems).toEqual(['"price" has different placeholders across languages']);
  });

  it('assertDictionariesComplete_withMissingKey_throwsDictionaryError', () => {
    expect(() => assertDictionariesComplete({ en: { a: 'A' }, vi: {} })).toThrow(DictionaryError);
  });
});

describe('project dictionaries', () => {
  const dictionaries = projectDictionaries();

  it('projectDictionaries_haveSameKeysAndPlaceholders', () => {
    expect(findDictionaryProblems(dictionaries)).toEqual([]);
  });

  it('englishAndVietnameseDictionaries_containNoCyrillic', () => {
    for (const language of ['en', 'vi']) {
      const leaks = Object.entries(dictionaries[language] ?? {}).filter(([, value]) => CYRILLIC.test(value));
      expect(leaks, language).toEqual([]);
    }
  });

  it('russianDictionary_containsNoVietnameseLettersOutsideAllowedWords', () => {
    const leaks = Object.entries(dictionaries.ru ?? {}).filter(
      ([key, value]) => VIETNAMESE_LETTER.test(value) && !VIETNAMESE_WORDS_ALLOWED_IN_RUSSIAN.has(key),
    );
    expect(leaks).toEqual([]);
  });
});

describe('parseDictionary', () => {
  it('parseDictionary_withEmptyValue_throws', () => {
    expect(() => parseDictionary('en', { title: '' })).toThrow(DictionaryError);
  });
});

describe('text and fillTemplate', () => {
  it('text_withUnknownKey_throws', () => {
    expect(() => text({ a: 'A' }, 'b')).toThrow(/no key "b"/);
  });

  it('fillTemplate_replacesKnownPlaceholdersAndKeepsUnknown', () => {
    expect(fillTemplate('{amount} per bottle, {unknown}', { amount: '₫50,000' })).toBe('₫50,000 per bottle, {unknown}');
  });
});
