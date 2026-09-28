import type { Language } from '../state/types';

const LOCALE: Record<Language, string> = { en: 'en-US', es: 'es-ES' };

export const localeFor = (lang: Language): string => LOCALE[lang] ?? LOCALE.en;

/** 'YYYY-MM-DD' in local time, used as calendar keys. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** e.g. "September 2026" / "septiembre de 2026" */
export function formatMonthYear(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(localeFor(lang), { month: 'long', year: 'numeric' }).format(date);
}

/** e.g. "Sep 15, 2026" / "15 sept 2026" */
export function formatDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** e.g. "Monday, September 15" */
export function formatLongDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** e.g. "7:30 AM" / "7:30" */
export function formatTime(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(localeFor(lang), { hour: 'numeric', minute: '2-digit' }).format(
    date,
  );
}

/** Short weekday initials for calendar headers, Sunday first. */
export function weekdayInitials(lang: Language): string[] {
  const base = new Date(2024, 8, 1); // a Sunday
  const fmt = new Intl.DateTimeFormat(localeFor(lang), { weekday: 'short' });
  return Array.from({ length: 7 }, (_, i) => {
    const label = fmt.format(addDays(base, i)).replace('.', '');
    return label.charAt(0).toUpperCase() + label.slice(1, 3);
  });
}
