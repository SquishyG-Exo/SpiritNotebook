import { formatMonthYear } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';
import { capitalizeFirst } from '../calendar/calendarModel';

export interface MonthSection {
  /** 'YYYY-MM' */
  key: string;
  /** "October 2026" / "Octubre de 2026" */
  title: string;
  data: JournalEntry[];
}

/** Entries grouped by the month they happened in, newest month first, newest entry first within it. */
export function groupByMonth(entries: readonly JournalEntry[], language: Language): MonthSection[] {
  const byKey = new Map<string, MonthSection>();
  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const entry of sorted) {
    const date = new Date(entry.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    let section = byKey.get(key);
    if (!section) {
      section = { key, title: capitalizeFirst(formatMonthYear(date, language)), data: [] };
      byKey.set(key, section);
    }
    section.data.push(entry);
  }
  return [...byKey.values()].sort((a, b) => b.key.localeCompare(a.key));
}
