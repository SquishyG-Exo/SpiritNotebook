import type { EntryContent, JournalEntry } from '../../state';

/** Splits model text on blank lines into display paragraphs. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/**
 * The note to display for an entry.
 *
 * Notes are written to `entry.content`, while sample entries resolve their
 * content per language from `entry.localized`. When the user has changed a
 * sample entry's note (it no longer matches the seeded copy), show theirs.
 */
export function displayNote(entry: JournalEntry, resolved: EntryContent): string | undefined {
  if (!entry.localized) return resolved.note;
  const seeded = entry.localized.en?.note;
  return entry.content.note !== seeded ? entry.content.note : resolved.note;
}
