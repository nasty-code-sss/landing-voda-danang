import { describe, expect, it } from 'vitest';
import { sitePath } from '../../../../src/shared/lib/site-path';

describe('sitePath', () => {
  it.each([
    [['/landing-voda-danang', 'en'], '/landing-voda-danang/en/'],
    [['/landing-voda-danang/', '/ru/'], '/landing-voda-danang/ru/'],
    [['/landing-voda-danang'], '/landing-voda-danang/'],
    [['/', 'vi'], '/vi/'],
    [['/'], '/'],
  ])('sitePath_%j_gives_%s', (segments, expected) => {
    const [base = '', ...rest] = segments;
    expect(sitePath(base, ...rest)).toBe(expected);
  });
});
