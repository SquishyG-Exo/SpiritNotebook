import { sampleEntries } from '../../brand/sample-entries';
import { addDays, startOfDay } from '../lib/dates';
import type { JournalEntry, SampleEntry } from './types';

function toEntry(sample: SampleEntry, now: Date): JournalEntry {
  const [hours, minutes] = sample.time.split(':').map(Number);
  const day = addDays(startOfDay(now), -sample.daysAgo);
  day.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return {
    id: sample.id,
    status: 'saved',
    createdAt: day.toISOString(),
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
