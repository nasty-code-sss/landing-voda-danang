import { describe, expect, it } from 'vitest';
import { describeSchedule, isOpenEveryDay } from '../../../../../src/entities/delivery/model/delivery-schedule';
import { WEEKDAY_ORDER } from '../../../../../src/shared/i18n/weekday-name';

const texts = { everyDay: 'every day, {opens}-{closes}', someDays: '{days}, {opens}-{closes}' };

describe('describeSchedule', () => {
  it('describeSchedule_allWeek_usesEveryDayText', () => {
    const schedule = { opensAt: '08:00', closesAt: '18:00', days: [...WEEKDAY_ORDER] };

    expect(describeSchedule(schedule, texts, 'en')).toBe('every day, 08:00-18:00');
    expect(isOpenEveryDay(schedule.days)).toBe(true);
  });

  it('describeSchedule_someDaysOutOfOrder_listsThemInWeekOrderInPageLanguage', () => {
    const schedule = { opensAt: '08:00', closesAt: '17:30', days: ['saturday', 'monday'] as const };

    expect(describeSchedule(schedule, texts, 'en')).toBe('Monday and Saturday, 08:00-17:30');
    expect(describeSchedule(schedule, texts, 'ru')).toBe('понедельник и суббота, 08:00-17:30');
    expect(isOpenEveryDay(schedule.days)).toBe(false);
  });
});
