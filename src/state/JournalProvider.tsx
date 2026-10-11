import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import type { CategoryKey, LifeSituationKey } from '../../brand/categories';
import { createId } from '../lib/ids';
import { buildSampleEntries } from './seed';
import type { EntryContent, JournalEntry, Reading } from './types';

interface State {
  entries: Record<string, JournalEntry>;
  /** Whisper ids (brand/whispers.ts) the reader saved. */
  savedWhispers: string[];
}

type Action =
  | { type: 'reset'; entries: JournalEntry[] }
  | { type: 'upsert'; entry: JournalEntry }
  | { type: 'remove'; id: string }
  | { type: 'toggleWhisper'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return { entries: Object.fromEntries(action.entries.map((e) => [e.id, e])), savedWhispers: [] };
    case 'upsert':
      return { ...state, entries: { ...state.entries, [action.entry.id]: action.entry } };
    case 'remove':
      return {
        ...state,
        entries: Object.fromEntries(Object.entries(state.entries).filter(([id]) => id !== action.id)),
      };
    case 'toggleWhisper':
      return {
        ...state,
        savedWhispers: state.savedWhispers.includes(action.id)
          ? state.savedWhispers.filter((id) => id !== action.id)
          : [action.id, ...state.savedWhispers],
      };
    default:
      return state;
  }
}

/** Applies a content field the reader edits (note, title) to every language copy, samples included. */
function withContent(entry: JournalEntry, patch: Partial<Pick<EntryContent, 'note' | 'title'>>): JournalEntry {
  const localized = entry.localized
    ? Object.fromEntries(
        Object.entries(entry.localized).map(([lang, content]) => [lang, content ? { ...content, ...patch } : content]),
      )
    : undefined;
  return { ...entry, content: { ...entry.content, ...patch }, localized };
}

export interface DraftInput {
  text: string;
  /** The reader's optional title. */
  title?: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  hasPhoto?: boolean;
  /** When it happened (defaults to now). */
  date?: Date;
  /** Whether `date` carries a meaningful time (defaults to true). */
  hasTime?: boolean;
}

/** Local noon for date-only entries, so time zones never move them to another day. */
function occurrence(date: Date | undefined, hasTime: boolean): Date {
  const when = date ? new Date(date) : new Date();
  if (!hasTime) when.setHours(12, 0, 0, 0);
  return when;
}

export interface JournalContextValue {
  /** Every entry, drafts included. */
  entries: JournalEntry[];
  /** Saved entries, newest first. */
  savedEntries: JournalEntry[];
  getEntry: (id: string) => JournalEntry | undefined;
  /** Creates an unsaved draft (no reading yet) and returns it. */
  createDraft: (input: DraftInput) => JournalEntry;
  setReading: (id: string, reading: Reading) => void;
  /** Promotes a draft to a saved entry, optionally with a note. Keeps the chosen date. */
  saveEntry: (id: string, options?: { note?: string }) => void;
  updateNote: (id: string, note: string) => void;
  updateTitle: (id: string, title: string) => void;
  toggleFavorite: (id: string) => void;
  discardDraft: (id: string) => void;
  /** Saved entries marked as favorites, newest first. */
  favoriteEntries: JournalEntry[];
  /** Whisper ids saved from Whispers of Wisdom, most recent first. */
  savedWhispers: string[];
  toggleWhisper: (id: string) => void;
  /** Restores the preloaded demo journal (and clears saved whispers). */
  resetDemo: () => void;
}

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    entries: Object.fromEntries(buildSampleEntries().map((e) => [e.id, e])),
    savedWhispers: [] as string[],
  }));

  const entries = useMemo(() => Object.values(state.entries), [state.entries]);
  const savedEntries = useMemo(
    () =>
      entries
        .filter((e) => e.status === 'saved')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries],
  );

  const favoriteEntries = useMemo(() => savedEntries.filter((e) => e.favorite), [savedEntries]);

  const getEntry = useCallback((id: string) => state.entries[id], [state.entries]);

  const createDraft = useCallback((input: DraftInput) => {
    const hasTime = input.hasTime ?? true;
    const title = input.title?.trim();
    const entry: JournalEntry = {
      id: createId(),
      status: 'draft',
      createdAt: occurrence(input.date, hasTime).toISOString(),
      hasTime,
      category: input.category,
      subcategory: input.subcategory,
      hasPhoto: input.hasPhoto,
      content: { text: input.text.trim(), ...(title ? { title } : {}) },
    };
    dispatch({ type: 'upsert', entry });
    return entry;
  }, []);

  const setReading = useCallback(
    (id: string, reading: Reading) => {
      const entry = state.entries[id];
      if (!entry) return;
      dispatch({ type: 'upsert', entry: { ...entry, content: { ...entry.content, reading } } });
    },
    [state.entries],
  );

  const saveEntry = useCallback(
    (id: string, options?: { note?: string }) => {
      const entry = state.entries[id];
      if (!entry) return;
      const note = options?.note?.trim();
      const saved: JournalEntry = { ...entry, status: 'saved' };
      dispatch({ type: 'upsert', entry: note ? withContent(saved, { note }) : saved });
    },
    [state.entries],
  );

  const updateNote = useCallback(
    (id: string, note: string) => {
      const entry = state.entries[id];
      if (!entry) return;
      dispatch({ type: 'upsert', entry: withContent(entry, { note: note.trim() || undefined }) });
    },
    [state.entries],
  );

  const updateTitle = useCallback(
    (id: string, title: string) => {
      const entry = state.entries[id];
      if (!entry) return;
      dispatch({ type: 'upsert', entry: withContent(entry, { title: title.trim() || undefined }) });
    },
    [state.entries],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const entry = state.entries[id];
      if (!entry) return;
      dispatch({ type: 'upsert', entry: { ...entry, favorite: !entry.favorite } });
    },
    [state.entries],
  );

  const toggleWhisper = useCallback((id: string) => dispatch({ type: 'toggleWhisper', id }), []);

  const discardDraft = useCallback(
    (id: string) => {
      if (state.entries[id]?.status === 'draft') dispatch({ type: 'remove', id });
    },
    [state.entries],
  );

  const resetDemo = useCallback(() => dispatch({ type: 'reset', entries: buildSampleEntries() }), []);

  const value = useMemo<JournalContextValue>(
    () => ({
      entries,
      savedEntries,
      getEntry,
      createDraft,
      setReading,
      saveEntry,
      updateNote,
      updateTitle,
      toggleFavorite,
      discardDraft,
      favoriteEntries,
      savedWhispers: state.savedWhispers,
      toggleWhisper,
      resetDemo,
    }),
    [
      entries,
      savedEntries,
      getEntry,
      createDraft,
      setReading,
      saveEntry,
      updateNote,
      updateTitle,
      toggleFavorite,
      discardDraft,
      favoriteEntries,
      state.savedWhispers,
      toggleWhisper,
      resetDemo,
    ],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal(): JournalContextValue {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>');
  return ctx;
}
