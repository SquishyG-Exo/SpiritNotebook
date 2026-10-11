import type { CategoryKey, LifeSituationKey } from '../../brand/categories';

export type Language = 'en' | 'es';

export type ReadingKind = 'reading' | 'care';

/** 'advisor': the executor model consults a stronger advisor model before writing (lab setting). */
export type ReadingMode = 'standard' | 'advisor';

export interface AdvisorSummary {
  requested: boolean;
  consulted: boolean;
}

/** What the AI guide returns for one entry. */
export interface Reading {
  kind: ReadingKind;
  title: string;
  interpretation: string;
  reflectionQuestion: string;
  language: Language;
  /** Which models produced it stays server-side (function logs); the client never sees model ids. */
  advisor?: AdvisorSummary;
  /** The advisor's guidance, when the advisor model returns it in plain text. */
  advice?: string;
  /** Server-side time to produce the reading. */
  durationMs?: number;
}

export interface EntryContent {
  /** The reader's own title, e.g. "Blue boat" (optional; search matches it first). */
  title?: string;
  text: string;
  reading?: Reading;
  /** "Journal my thoughts" note. */
  note?: string;
}

export type EntryStatus = 'draft' | 'saved';

export interface JournalEntry {
  id: string;
  status: EntryStatus;
  /**
   * When the experience happened, chosen by the reader (defaults to now).
   * ISO timestamp; when `hasTime` is false it holds local noon of that day
   * and the time must not be shown.
   */
  createdAt: string;
  /** False when the reader saved a date without a time. */
  hasTime: boolean;
  /** Saved to Favorites ("Saved"). */
  favorite?: boolean;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  /** Photo attachment is UI-only in this proof of concept. */
  hasPhoto?: boolean;
  isSample?: boolean;
  /** Content in the language it was written in. */
  content: EntryContent;
  /** Sample entries ship in every language so the demo reads well after a language switch. */
  localized?: Partial<Record<Language, EntryContent>>;
}

/** Shape of the preloaded demo entries in brand/sample-entries.ts. */
export interface SampleEntry {
  id: string;
  /** Days before "today" the entry happened (0 = today). Ignored when `monthDay` is set. */
  daysAgo?: number;
  /** Fixed calendar day 'MM-DD': resolves to its most recent occurrence on or before today. */
  monthDay?: string;
  /** With `monthDay`: use last year's date while this year's is fewer than this many days ago (keeps related samples in order). */
  minDaysAgo?: number;
  /** Local time of day, 'HH:mm'. Omit for a date-only entry. */
  time?: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  hasPhoto?: boolean;
  favorite?: boolean;
  content: Record<Language, EntryContent & { reading: Reading }>;
}

export function resolveContent(entry: JournalEntry, language: Language): EntryContent {
  return entry.localized?.[language] ?? entry.content;
}

/** The title to show for an entry: the reader's own, then the reading's, then the first words. */
export function entryTitle(entry: JournalEntry, language: Language): string {
  const content = resolveContent(entry, language);
  const own = content.title?.trim();
  if (own) return own;
  const reading = content.reading?.title?.trim();
  if (reading) return reading;
  const words = content.text.trim().split(/\s+/).slice(0, 7).join(' ');
  return words.length < content.text.trim().length ? `${words}…` : words;
}
