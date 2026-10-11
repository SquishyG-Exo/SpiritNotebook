/**
 * Date and optional time for a new entry ("when did it happen?").
 *
 * Pure helpers, no React: the composer keeps a day (local midnight) and an
 * optional time of day, and turns them into the `date` / `hasTime` pair that
 * createDraft() expects. Days after today are never allowed.
 */
import { addDays, dateKey, isSameDay, localeFor, parseDateKey, startOfDay } from '../../lib/dates';
import type { Language } from '../../state/types';

/** A time of day in 24-hour form. */
export interface TimeOfDay {
  /** 0–23 */
  hour: number;
  /** 0–59 */
  minute: number;
}

/** Minute stepper granularity. */
export const MINUTE_STEP = 5;

export function timeOf(date: Date): TimeOfDay {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

/** 12-hour view of a time: hour 1–12 and whether it is after noon. */
export function toTwelveHour({ hour }: TimeOfDay): { hour12: number; pm: boolean } {
  return { hour12: hour % 12 === 0 ? 12 : hour % 12, pm: hour >= 12 };
}

function fromTwelveHour(hour12: number, pm: boolean): number {
  return (hour12 % 12) + (pm ? 12 : 0);
}

/** Moves the hour within its half of the day (1…12 wraps), like a picker wheel. AM/PM is its own control. */
export function stepHour(time: TimeOfDay, delta: 1 | -1): TimeOfDay {
  const { hour12, pm } = toTwelveHour(time);
  const next = ((hour12 - 1 + delta + 12) % 12) + 1;
  return { ...time, hour: fromTwelveHour(next, pm) };
}

/** Snaps to the next / previous multiple of MINUTE_STEP, wrapping within the hour. */
export function stepMinute(time: TimeOfDay, delta: 1 | -1): TimeOfDay {
  const { minute } = time;
  const next =
    delta > 0
      ? (Math.floor(minute / MINUTE_STEP) + 1) * MINUTE_STEP
      : minute % MINUTE_STEP === 0
        ? minute - MINUTE_STEP
        : Math.floor(minute / MINUTE_STEP) * MINUTE_STEP;
  return { ...time, minute: (next + 60) % 60 };
}

export function setPm(time: TimeOfDay, pm: boolean): TimeOfDay {
  const { hour12 } = toTwelveHour(time);
  return { ...time, hour: fromTwelveHour(hour12, pm) };
}

/** On today, a time later than now moves back to now: an entry records something that already happened. */
export function notAfterNow(day: Date, time: TimeOfDay, now: Date): TimeOfDay {
  if (!isSameDay(day, now)) return time;
  const current = timeOf(now);
  return time.hour * 60 + time.minute > current.hour * 60 + current.minute ? current : time;
}

/** The moment to store: the chosen day at the chosen time, or that day's local noon when there is no time. */
export function combineDayAndTime(day: Date, time: TimeOfDay | null): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time ? time.hour : 12, time ? time.minute : 0);
}

export function isAfterToday(day: Date, now: Date): boolean {
  return startOfDay(day).getTime() > startOfDay(now).getTime();
}

/**
 * The composer's `date` route param: a real 'YYYY-MM-DD' day that is not in
 * the future, as local midnight. Anything else is ignored (undefined).
 */
export function parseDayParam(value: string | undefined, now: Date): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const day = parseDateKey(value);
  if (dateKey(day) !== value) return undefined; // e.g. 2026-02-31
  return isAfterToday(day, now) ? undefined : startOfDay(day);
}

export type RelativeDay = 'today' | 'yesterday' | null;

export function relativeDay(day: Date, now: Date): RelativeDay {
  if (isSameDay(day, now)) return 'today';
  if (isSameDay(day, addDays(now, -1))) return 'yesterday';
  return null;
}

/** Localised AM / PM markers ("AM"/"PM", "a. m."/"p. m."), from the same locale the app formats times with. */
export function dayPeriodLabels(language: Language): { am: string; pm: string } {
  const format = new Intl.DateTimeFormat(localeFor(language), { hour: 'numeric', hour12: true });
  const period = (date: Date) => format.formatToParts(date).find((part) => part.type === 'dayPeriod')?.value;
  return {
    am: period(new Date(2024, 0, 1, 9)) ?? 'AM',
    pm: period(new Date(2024, 0, 1, 21)) ?? 'PM',
  };
}

/* ---------- month grid for the date sheet ---------- */

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
  /** After today: shown, but not selectable. */
  future: boolean;
}

export const monthOf = (date: Date): MonthRef => ({ year: date.getFullYear(), month: date.getMonth() });

export const shiftMonth = ({ year, month }: MonthRef, delta: number): MonthRef =>
  monthOf(new Date(year, month + delta, 1));

export const sameMonth = (a: MonthRef, b: MonthRef): boolean => a.year === b.year && a.month === b.month;

export const firstOfMonth = ({ year, month }: MonthRef): Date => new Date(year, month, 1);

/** Six weeks, Sunday first, so the sheet keeps the same height every month. */
export function buildMonthGrid(ref: MonthRef, now: Date): DayCell[][] {
  const first = firstOfMonth(ref);
  const start = addDays(first, -first.getDay());
  const weeks: DayCell[][] = [];
  for (let w = 0; w < 6; w += 1) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(start, w * 7 + d);
      week.push({
        key: dateKey(date),
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === ref.month,
        future: isAfterToday(date, now),
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** "octubre de 2026" → "Octubre de 2026" for a heading. */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
