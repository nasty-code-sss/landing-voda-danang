import { describe, expect, it } from 'vitest';
import { countWithNoun } from '../../../../src/shared/i18n/plural';

const RUSSIAN_BOTTLES = {
  one: '{count} бутыль',
  few: '{count} бутыли',
  many: '{count} бутылей',
  other: '{count} бутыли',
};

describe('countWithNoun', () => {
  it.each([
    [1, '1 бутыль'],
    [3, '3 бутыли'],
    [5, '5 бутылей'],
    [21, '21 бутыль'],
    [20, '20 бутылей'],
  ])('countWithNoun_inRussian_for_%i_gives_%s', (count, expected) => {
    expect(countWithNoun(count, 'ru', RUSSIAN_BOTTLES)).toBe(expected);
  });

  it('countWithNoun_inEnglish_usesOneAndOther', () => {
    const forms = { one: '{count} bottle', few: '{count} bottles', many: '{count} bottles', other: '{count} bottles' };

    expect(countWithNoun(1, 'en', forms)).toBe('1 bottle');
    expect(countWithNoun(3, 'en', forms)).toBe('3 bottles');
  });
});
