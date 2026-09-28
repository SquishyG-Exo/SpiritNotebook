import { addDays, dateKey, localeFor, parseDateKey } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';

/** A calendar month; `month` is 0-based like Date#getMonth. */
export interface MonthRef {
  year: number;
  month: number;
}

export interface DayCell {
  key: string;
  date: Date;
  day: number;
  inMonth: boolean;
}

export const monthOf = (date: Date): MonthRef => ({ year: date.getFullYear(), month: date.getMonth() });

export const monthOfKey = (key: string): MonthRef => monthOf(parseDateKey(key));

export const shiftMonth = ({ year, month }: MonthRef, delta: number): MonthRef =>
  monthOf(new Date(year, month + delta, 1));

/** 'YYYY-MM', the prefix shared by every dateKey in that month. */
export const monthKey = ({ year, month }: MonthRef): string =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export const firstOfMonth = ({ year, month }: MonthRef): Date => new Date(year, month, 1);

/** True for a real 'YYYY-MM-DD' calendar day (rejects '2026-02-31'). */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return dateKey(parseDateKey(value)) === value;
}

/** Six weeks, Sunday first, so the grid keeps the same height every month. */
export function buildMonthGrid(ref: MonthRef): DayCell[][] {
  const first = firstOfMonth(ref);
  const start = addDays(first, -first.getDay());
  const weeks: DayCell[][] = [];
  for (let w = 0; w < 6; w += 1) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(start, w * 7 + d);
      week.push({ key: dateKey(date), date, day: date.getDate(), inMonth: date.getMonth() === ref.month });
    }
    weeks.push(week);
  }
  return weeks;
}

/** Saved entries by local day; keeps the incoming order (newest first). */
export function groupByDay(entries: readonly JournalEntry[]): Map<string, JournalEntry[]> {
  const byDay = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const key = dateKey(new Date(entry.createdAt));
    const list = byDay.get(key);
    if (list) list.push(entry);
    else byDay.set(key, [entry]);
  }
  return byDay;
}

export function countInMonth(byDay: Map<string, JournalEntry[]>, ref: MonthRef): number {
  const prefix = `${monthKey(ref)}-`;
  let count = 0;
  for (const [key, list] of byDay) if (key.startsWith(prefix)) count += list.length;
  return count;
}

/** Latest day with entries in the month, if any (keys sort chronologically). */
export function latestEntryDayInMonth(byDay: Map<string, JournalEntry[]>, ref: MonthRef): string | undefined {
  const prefix = `${monthKey(ref)}-`;
  let latest: string | undefined;
  for (const key of byDay.keys()) if (key.startsWith(prefix) && (!latest || key > latest)) latest = key;
  return latest;
}

/** Month name alone ("August" / "agosto"), for sentences like "3 entries in August". */
export function formatMonthName(ref: MonthRef, language: Language): string {
  return new Intl.DateTimeFormat(localeFor(language), { month: 'long' }).format(firstOfMonth(ref));
}

/** "septiembre de 2026" → "Septiembre de 2026" for use as a heading. */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** Title for an entry row: the reading title, else the start of the text. */
export function excerpt(text: string, max = 40): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '')}…`;
}

/** First value of a route param that may arrive as an array. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : undefined;
}
