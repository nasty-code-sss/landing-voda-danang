import {
  CYRILLIC_LETTER,
  expect,
  HAN_CHARACTER,
  HANGUL_LETTER,
  mainText,
  test,
  VIETNAMESE_LETTER,
} from '../fixtures/site-test.ts';

const FOREIGN_LETTERS = [
  { language: 'en', script: 'cyrillic', letter: CYRILLIC_LETTER },
  { language: 'en', script: 'hangul', letter: HANGUL_LETTER },
  { language: 'en', script: 'han', letter: HAN_CHARACTER },
  { language: 'vi', script: 'cyrillic', letter: CYRILLIC_LETTER },
  { language: 'vi', script: 'hangul', letter: HANGUL_LETTER },
  { language: 'vi', script: 'han', letter: HAN_CHARACTER },
  { language: 'ru', script: 'vietnamese', letter: VIETNAMESE_LETTER },
  { language: 'ru', script: 'hangul', letter: HANGUL_LETTER },
  { language: 'ru', script: 'han', letter: HAN_CHARACTER },
  { language: 'ko', script: 'cyrillic', letter: CYRILLIC_LETTER },
  { language: 'ko', script: 'vietnamese', letter: VIETNAMESE_LETTER },
  { language: 'ko', script: 'han', letter: HAN_CHARACTER },
  { language: 'zh', script: 'cyrillic', letter: CYRILLIC_LETTER },
  { language: 'zh', script: 'vietnamese', letter: VIETNAMESE_LETTER },
  { language: 'zh', script: 'hangul', letter: HANGUL_LETTER },
];
const CONTEXT_LENGTH = 25;

function leakAround(text: string, letter: RegExp): string | null {
  const context = `.{0,${CONTEXT_LENGTH}}`;
  return text.match(new RegExp(`${context}${letter.source}${context}`, letter.flags))?.[0] ?? null;
}

test.describe('scenario 14: no language leak', () => {
  for (const { language, script, letter } of FOREIGN_LETTERS) {
    test(`main text of /${language}/ has no ${script} letters`, async ({ page }) => {
      await page.goto(`${language}/`);

      expect(leakAround(await mainText(page), letter)).toBeNull();
    });
  }
});
