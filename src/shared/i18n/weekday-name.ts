export const WEEKDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export type Weekday = (typeof WEEKDAY_ORDER)[number];

const A_KNOWN_MONDAY_UTC = Date.UTC(2024, 0, 1);
const MILLISECONDS_PER_DAY = 86_400_000;
const UTC_ZONE = 'UTC';

export function weekdayName(day: Weekday, language: string): string {
  const moment = new Date(A_KNOWN_MONDAY_UTC + WEEKDAY_ORDER.indexOf(day) * MILLISECONDS_PER_DAY);
  return new Intl.DateTimeFormat(language, { weekday: 'long', timeZone: UTC_ZONE }).format(moment);
}
