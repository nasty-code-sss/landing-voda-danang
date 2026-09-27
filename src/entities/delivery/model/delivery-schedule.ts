import { formatList } from '../../../shared/i18n/list-format';
import { fillTemplate } from '../../../shared/i18n/template';
import { WEEKDAY_ORDER, weekdayName, type Weekday } from '../../../shared/i18n/weekday-name';

export interface DeliverySchedule {
  readonly opensAt: string;
  readonly closesAt: string;
  readonly days: readonly Weekday[];
}

export interface ScheduleTexts {
  readonly everyDay: string;
  readonly someDays: string;
}

export function isOpenEveryDay(days: readonly Weekday[]): boolean {
  return WEEKDAY_ORDER.every((day) => days.includes(day));
}

export function describeSchedule(schedule: DeliverySchedule, texts: ScheduleTexts, language: string): string {
  const hours = { opens: schedule.opensAt, closes: schedule.closesAt };
  if (isOpenEveryDay(schedule.days)) {
    return fillTemplate(texts.everyDay, hours);
  }
  const orderedDays = WEEKDAY_ORDER.filter((day) => schedule.days.includes(day));
  const days = formatList(
    orderedDays.map((day) => weekdayName(day, language)),
    language,
    'conjunction',
  );
  return fillTemplate(texts.someDays, { ...hours, days });
}
