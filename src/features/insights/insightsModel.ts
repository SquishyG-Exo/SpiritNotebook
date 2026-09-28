import type { CategoryKey } from '../../../brand/categories';
import { addDays, dateKey, localeFor, startOfDay } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';

export interface WeekBucket {
  start: Date;
  end: Date;
  count: number;
  /** The most recent 7 days, ending today. */
  isCurrent: boolean;
}

export interface InsightStats {
  /** Saved entries dated in the current calendar month. */
  monthCount: number;
  /** Distinct days with at least one entry in the last 30 days (today included). */
  daysNoted: number;
  /** Most frequent category this month; ties go to the most recently used. */
  topCategory?: { key: CategoryKey; count: number };
  /** Distinct categories used this month. */
  categoryCount: number;
  /** Four rolling 7-day weeks, oldest first, the last one ending today. */
  weeks: WeekBucket[];
}

export function computeInsightStats(entries: readonly JournalEntry[], now: Date): InsightStats {
  const today = startOfDay(now);
  const todayKey = dateKey(today);
  const monthPrefix = todayKey.slice(0, 8); // 'YYYY-MM-'
  const since30 = dateKey(addDays(today, -29));

  const weeks: WeekBucket[] = [3, 2, 1, 0].map((ago) => {
    const end = addDays(today, -7 * ago);
    return { start: addDays(end, -6), end, count: 0, isCurrent: ago === 0 };
  });
  const weekRanges = weeks.map((w) => [dateKey(w.start), dateKey(w.end)] as const);

  let monthCount = 0;
  const days = new Set<string>();
  // Map keeps first-seen order; entries arrive newest first, so ties favour recency.
  const byCategory = new Map<CategoryKey, number>();

  for (const entry of entries) {
    const key = dateKey(new Date(entry.createdAt));
    if (key > todayKey) continue;
    if (key.startsWith(monthPrefix)) {
      monthCount += 1;
      byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + 1);
    }
    if (key >= since30) days.add(key);
    weekRanges.forEach(([from, to], i) => {
      if (key >= from && key <= to) weeks[i].count += 1;
    });
  }

  let topCategory: InsightStats['topCategory'];
  for (const [key, count] of byCategory) {
    if (!topCategory || count > topCategory.count) topCategory = { key, count };
  }

  return { monthCount, daysNoted: days.size, topCategory, categoryCount: byCategory.size, weeks };
}

/** "Sep 1 – 7" / "1–7 sept", falling back to two short dates where formatRange is missing. */
export function formatWeekRange(start: Date, end: Date, language: Language): string {
  const format = new Intl.DateTimeFormat(localeFor(language), { month: 'short', day: 'numeric' });
  const ranged = format as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };
  if (typeof ranged.formatRange === 'function') return ranged.formatRange(start, end).replace(/\./g, '');
  return `${format.format(start)} – ${format.format(end)}`.replace(/\./g, '');
}


