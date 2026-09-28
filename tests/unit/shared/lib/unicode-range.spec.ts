import { describe, expect, it } from 'vitest';
import { codePointsOf, coversAny, parseUnicodeRange } from '../../../../src/shared/lib/unicode-range';

describe('parseUnicodeRange', () => {
  it('parseUnicodeRange_readsSinglePointsAndIntervals', () => {
    expect(parseUnicodeRange('U+ac00-ac0f, U+ff03')).toEqual([
      { from: 0xac00, to: 0xac0f },
      { from: 0xff03, to: 0xff03 },
    ]);
  });

  it('parseUnicodeRange_expandsWildcards', () => {
    expect(parseUnicodeRange('U+4??')).toEqual([{ from: 0x400, to: 0x4ff }]);
  });
});

describe('codePointsOf', () => {
  it('codePointsOf_returnsEachCharacterOnce', () => {
    expect(codePointsOf('물물수')).toEqual([0xbb3c, 0xc218]);
  });
});

describe('coversAny', () => {
  const hangulSyllables = parseUnicodeRange('U+ac00-d7a3');

  it('coversAny_withHangulText_isTrue', () => {
    expect(coversAny(hangulSyllables, codePointsOf('다낭'))).toBe(true);
  });

  it('coversAny_withLatinText_isFalse', () => {
    expect(coversAny(hangulSyllables, codePointsOf('Da Nang'))).toBe(false);
  });
});
