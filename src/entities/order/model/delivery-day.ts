const MINUTES_PER_HOUR = 60;
const NUMERIC_CLOCK_LOCALE = 'en-GB';

function minutesOfClockTime(clockTime: string): number {
  const [hours = 0, minutes = 0] = clockTime.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

function minutesOfDayInZone(moment: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat(NUMERIC_CLOCK_LOCALE, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(moment);
  const partValue = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return partValue('hour') * MINUTES_PER_HOUR + partValue('minute');
}

export function isSameDayDeliveryOpen(now: Date, sameDayUntil: string, timeZone: string): boolean {
  return minutesOfDayInZone(now, timeZone) < minutesOfClockTime(sameDayUntil);
}
