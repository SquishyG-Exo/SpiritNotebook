import type { CategoryKey, LifeSituationKey } from '../../brand/categories';

export type Language = 'en' | 'es';

export type ReadingKind = 'reading' | 'care';

/** 'advisor': the executor model consults a stronger advisor model before writing (lab setting). */
export type ReadingMode = 'standard' | 'advisor';

export interface AdvisorSummary {
  requested: boolean;
  consulted: boolean;
  /** Advisor model id, when one was configured. */
  model?: string;
}

/** What the AI guide returns for one entry. */
export interface Reading {
  kind: ReadingKind;
  title: string;
  interpretation: string;
  reflectionQuestion: string;
  language: Language;
  /** Model id that produced it (absent for sample content). */
  model?: string;
  advisor?: AdvisorSummary;
  /** The advisor's guidance, when the advisor model returns it in plain text. */
  advice?: string;
  /** Server-side time to produce the reading. */
  durationMs?: number;
}

export interface EntryContent {
  text: string;
  reading?: Reading;
  /** "Journal my thoughts" note. */
  note?: string;
}

export type EntryStatus = 'draft' | 'saved';

export interface JournalEntry {
  id: string;
  status: EntryStatus;
  /** ISO timestamp. */
  createdAt: string;
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
  /** Days before "today" the entry was written (0 = today). */
  daysAgo: number;
  /** Local time of day, 'HH:mm'. */
  time: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  hasPhoto?: boolean;
  content: Record<Language, EntryContent & { reading: Reading }>;
}

export function resolveContent(entry: JournalEntry, language: Language): EntryContent {
  return entry.localized?.[language] ?? entry.content;
}
