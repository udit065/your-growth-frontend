import dayjs from 'dayjs';
import { DATE_FORMAT, todayKey } from './date';
import type { Entry } from './api';

type Entries = Record<string, Entry>;

/** Consecutive days with an entry, ending today (or yesterday if today isn't done yet). */
export function currentStreak(entries: Entries): number {
  let cursor = dayjs();
  if (!entries[todayKey()]) cursor = cursor.subtract(1, 'day');
  let count = 0;
  while (entries[cursor.format(DATE_FORMAT)]) {
    count++;
    cursor = cursor.subtract(1, 'day');
  }
  return count;
}

export function bestStreak(entries: Entries): number {
  const dates = Object.keys(entries).sort();
  let best = 0;
  let run = 0;
  let prev: dayjs.Dayjs | null = null;
  for (const date of dates) {
    const d = dayjs(date);
    run = prev && d.diff(prev, 'day') === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function countThisMonth(entries: Entries): number {
  const prefix = dayjs().format('YYYY-MM');
  return Object.keys(entries).filter((d) => d.startsWith(prefix)).length;
}

/** Last `n` days, oldest first. */
export function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => dayjs().subtract(n - 1 - i, 'day'));
}
