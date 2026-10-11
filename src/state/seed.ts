import { sampleEntries } from '../../brand/sample-entries';
import { addDays, startOfDay } from '../lib/dates';
import type { JournalEntry, SampleEntry } from './types';

/** The most recent `MM-DD` on or before `now` (this year, else last year). */
function lastOccurrence(monthDay: string, now: Date): Date {
  const [month, day] = monthDay.split('-').map(Number);
  const candidate = new Date(now.getFullYear(), (month ?? 1) - 1, day ?? 1);
  if (candidate > startOfDay(now)) candidate.setFullYear(now.getFullYear() - 1);
  return candidate;
}

function toEntry(sample: SampleEntry, now: Date): JournalEntry {
  const day = sample.monthDay
    ? lastOccurrence(sample.monthDay, now)
    : addDays(startOfDay(now), -(sample.daysAgo ?? 0));
  const hasTime = Boolean(sample.time);
  if (sample.time) {
    const [hours, minutes] = sample.time.split(':').map(Number);
    day.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  } else {
    day.setHours(12, 0, 0, 0);
  }
  return {
    id: sample.id,
    status: 'saved',
    createdAt: day.toISOString(),
    hasTime,
    favorite: sample.favorite,
    category: sample.category,
    subcategory: sample.subcategory,
    hasPhoto: sample.hasPhoto,
    isSample: true,
    content: sample.content.en,
    localized: sample.content,
  };
}

/** Builds the preloaded journal, dated relative to `now` so the demo always looks current. */
export function buildSampleEntries(now: Date = new Date()): JournalEntry[] {
  return sampleEntries.map((sample) => toEntry(sample, now));
}
