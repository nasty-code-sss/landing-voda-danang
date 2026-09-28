import { describe, expect, it } from 'vitest';
import { parseSiteConfig } from '../../../../../src/shared/config/site-config';
import { translator } from '../../../../../src/shared/i18n/dictionary';
import { faqEntries } from '../../../../../src/widgets/faq/model/faq-entries';
import { configFixture, projectDictionaries, rawConfigFixture } from '../../../../fixtures/site-config-fixture';

const dictionaries = projectDictionaries();
const NO_BREAK_SPACES = /[\u00A0\u202F]/g;
const answerOf = (entries: ReturnType<typeof faqEntries>, number: number) =>
  entries.find((entry) => entry.number === number)?.answer.replace(NO_BREAK_SPACES, ' ');

describe('faqEntries', () => {
  it('faqEntries_withDemoConfig_givesTenQuestionsWithNumbersFromConfig', () => {
    const entries = faqEntries(configFixture(), translator(dictionaries, 'ru'), 'ru');

    expect(entries.map((entry) => entry.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(entries[2]?.question).toBe('Можно заказать меньше 3 бутылей?');
    expect(answerOf(entries, 2)).toContain('от 45 000 ₫ до 50 000 ₫');
    expect(answerOf(entries, 7)).toBe(
      'У бутылей Biwa и Sunrise нет краника, нужна помпа или кулер. Помпу можно купить у нас, от 130 000 ₫: добавьте её к первому заказу. La Vie: бутыль с краником, помпа не нужна.',
    );
    expect(answerOf(entries, 10)).toBe('Да, возим каждый день, 08:00-18:00.');
  });

  it('faqEntries_withoutTrustPromises_dropsOriginalityQuestion', () => {
    const raw = rawConfigFixture();
    const trust = { sealed_bottles: false, washed_bottles: true, official_dealer: false, photo_before_delivery: false };
    const entries = faqEntries(parseSiteConfig({ ...raw, trust }), translator(dictionaries, 'en'), 'en');

    expect(entries.map((entry) => entry.number)).not.toContain(9);
  });

  it('faqEntries_withCashOnlyAndWeekdays_adaptsAnswers', () => {
    const raw = rawConfigFixture();
    const config = parseSiteConfig({
      ...raw,
      payments: ['cash'],
      delivery: { ...raw.delivery, days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    });
    const entries = faqEntries(config, translator(dictionaries, 'en'), 'en');

    expect(answerOf(entries, 5)).toBe('Pay the courier in cash when the water arrives.');
    expect(answerOf(entries, 10)).toBe('We deliver on Monday, Tuesday, Wednesday, Thursday, and Friday, 08:00-18:00.');
  });
});
