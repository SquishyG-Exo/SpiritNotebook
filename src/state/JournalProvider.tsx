import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import type { CategoryKey, LifeSituationKey } from '../../brand/categories';
import { createId } from '../lib/ids';
import { buildSampleEntries } from './seed';
import type { JournalEntry, Reading } from './types';

interface State {
  entries: Record<string, JournalEntry>;
}

type Action =
  | { type: 'reset'; entries: JournalEntry[] }
  | { type: 'upsert'; entry: JournalEntry }
  | { type: 'remove'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return { entries: Object.fromEntries(action.entries.map((e) => [e.id, e])) };
    case 'upsert':
      return { entries: { ...state.entries, [action.entry.id]: action.entry } };
    case 'remove':
      return {
        entries: Object.fromEntries(Object.entries(state.entries).filter(([id]) => id !== action.id)),
      };
    default:
      return state;
  }
}

export interface DraftInput {
  text: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  hasPhoto?: boolean;
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
  /** Promotes a draft to a saved entry, optionally with a note. */
  saveEntry: (id: string, options?: { note?: string }) => void;
  updateNote: (id: string, note: string) => void;
  discardDraft: (id: string) => void;
  /** Restores the preloaded demo journal. */
  resetDemo: () => void;
}

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    entries: Object.fromEntries(buildSampleEntries().map((e) => [e.id, e])),
  }));

  const entries = useMemo(() => Object.values(state.entries), [state.entries]);
  const savedEntries = useMemo(
    () =>
      entries
        .filter((e) => e.status === 'saved')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries],
  );

  const getEntry = useCallback((id: string) => state.entries[id], [state.entries]);

  const createDraft = useCallback((input: DraftInput) => {
    const entry: JournalEntry = {
      id: createId(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      category: input.category,
      subcategory: input.subcategory,
      hasPhoto: input.hasPhoto,
      content: { text: input.text.trim() },
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
      dispatch({
        type: 'upsert',
        entry: {
          ...entry,
          status: 'saved',
          createdAt: entry.status === 'saved' ? entry.createdAt : new Date().toISOString(),
          content: { ...entry.content, note: note || entry.content.note },
        },
      });
    },
    [state.entries],
  );

  const updateNote = useCallback(
    (id: string, note: string) => {
      const entry = state.entries[id];
      if (!entry) return;
      dispatch({
        type: 'upsert',
        entry: { ...entry, content: { ...entry.content, note: note.trim() || undefined } },
      });
    },
    [state.entries],
  );

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
      discardDraft,
      resetDemo,
    }),
    [entries, savedEntries, getEntry, createDraft, setReading, saveEntry, updateNote, discardDraft, resetDemo],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal(): JournalContextValue {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>');
  return ctx;
}
