import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';

/** Local calendar date, offset by `days` from today. */
export function dayKey(days = 0): string {
  return dayjs().add(days, 'day').format(DATE_FORMAT);
}

export const todayKey = () => dayKey(0);
export const yesterdayKey = () => dayKey(-1);

export function isValidDayKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid();
}

/** "Today", "Yesterday", or e.g. "Mon, 17 Nov". */
export function relativeDayLabel(date: string): string {
  if (date === todayKey()) return 'Today';
  if (date === yesterdayKey()) return 'Yesterday';
  const d = dayjs(date);
  return d.format(d.year() === dayjs().year() ? 'ddd, D MMM' : 'ddd, D MMM YYYY');
}

export function greeting(): string {
  const h = dayjs().hour();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
