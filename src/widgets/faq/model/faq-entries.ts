import { brandsWithTap } from '../../../entities/brand/model/brand';
import { describeSchedule } from '../../../entities/delivery/model/delivery-schedule';
import { BOTTLES_PREFIX, brandsFromConfig } from '../../../features/order-builder/model/builder-data';
import type { SiteConfig } from '../../../shared/config/site-config';
import type { Translate } from '../../../shared/i18n/dictionary';
import { formatList } from '../../../shared/i18n/list-format';
import { formatMoney } from '../../../shared/i18n/number-format';
import { countWithNoun, pluralFormsOf } from '../../../shared/i18n/plural';
import { fillTemplate } from '../../../shared/i18n/template';

export interface FaqEntry {
  readonly number: number;
  readonly question: string;
  readonly answer: string;
}

interface FaqContext {
  readonly config: SiteConfig;
  readonly say: Translate;
  readonly language: string;
}

const SENTENCE_SEPARATOR = ' ';

function sentences(parts: readonly (string | null)[]): string {
  return parts.filter((part): part is string => part !== null).join(SENTENCE_SEPARATOR);
}

function money({ config, language }: FaqContext, amount: number): string {
  return formatMoney(amount, language, config.money.currency);
}

function depositRange(context: FaqContext): string {
  const deposits = context.config.brands.map((brand) => brand.deposit);
  const lowest = Math.min(...deposits);
  const highest = Math.max(...deposits);
  if (lowest === highest) {
    return money(context, lowest);
  }
  return fillTemplate(context.say('money.range'), { from: money(context, lowest), to: money(context, highest) });
}

function brandNames({ config, language }: FaqContext, hasTap: boolean): string | null {
  const names = brandsWithTap(brandsFromConfig(config), hasTap).map((brand) => brand.name);
  return names.length === 0 ? null : formatList(names, language, 'conjunction');
}

function pumpAnswer(context: FaqContext): string {
  const { config, say } = context;
  const withoutTap = brandNames(context, false);
  const withTap = brandNames(context, true);
  const pumpPrices = config.pumps.map((pump) => pump.price);
  return sentences([
    withoutTap === null ? null : fillTemplate(say('faq.7.a.no_tap'), { brands: withoutTap }),
    withoutTap === null || pumpPrices.length === 0
      ? null
      : fillTemplate(say('faq.7.a.pump'), { price: money(context, Math.min(...pumpPrices)) }),
    withTap === null ? null : fillTemplate(say('faq.7.a.tap'), { brands: withTap }),
  ]);
}

function paymentAnswer({ config, say }: FaqContext): string {
  return sentences(config.payments.map((payment) => say(`faq.5.a.${payment}`)));
}

function originalityAnswer({ config, say }: FaqContext): string {
  return sentences([
    config.trust.sealedBottles ? say('faq.9.a.sealed') : null,
    config.trust.officialDealer ? say('faq.9.a.dealer') : null,
    config.trust.photoBeforeDelivery ? say('faq.9.a.photo') : null,
  ]);
}

function scheduleAnswer({ config, say, language }: FaqContext, prefix: string): string {
  return describeSchedule(
    config.delivery,
    { everyDay: say(`${prefix}.every_day`), someDays: say(`${prefix}.some_days`) },
    language,
  );
}

export function faqEntries(config: SiteConfig, say: Translate, language: string): FaqEntry[] {
  const context: FaqContext = { config, say, language };
  const minimum = config.order.minQuantity;
  const answers: readonly (readonly [number, string, string])[] = [
    [1, say('faq.1.q'), say('faq.1.a')],
    [2, say('faq.2.q'), fillTemplate(say('faq.2.a'), { deposits: depositRange(context) })],
    [
      3,
      fillTemplate(say('faq.3.q'), { minimum }),
      fillTemplate(say('faq.3.a'), { bottles: countWithNoun(minimum, language, pluralFormsOf(say, BOTTLES_PREFIX)) }),
    ],
    [4, say('faq.4.q'), say('faq.4.a')],
    [5, say('faq.5.q'), paymentAnswer(context)],
    [6, say('faq.6.q'), say('faq.6.a')],
    [7, say('faq.7.q'), pumpAnswer(context)],
    [
      8,
      say('faq.8.q'),
      fillTemplate(say('faq.8.a'), {
        time: config.delivery.sameDayUntil,
        schedule: scheduleAnswer(context, 'schedule'),
      }),
    ],
    [9, say('faq.9.q'), originalityAnswer(context)],
    [10, say('faq.10.q'), scheduleAnswer(context, 'faq.10.a')],
  ];
  return answers
    .map(([number, question, answer]) => ({ number, question, answer }))
    .filter((entry) => entry.answer.length > 0);
}
