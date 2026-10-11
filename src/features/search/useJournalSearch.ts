import { useCallback, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { categoryLabel, situationLabel } from '../../lib/categoryCopy';
import {
  createSearchIndex,
  filterEntries,
  hasMatches,
  parseQuery,
  searchIndex,
  suggestQueries,
  type SearchFilter,
  type SearchResult,
} from '../../lib/search';
import { resolveContent, useJournal, useSettings, type JournalEntry } from '../../state';

/** How many example queries to offer before the reader types. */
const MAX_SUGGESTIONS = 4;

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export interface JournalSearch {
  /** The query the results belong to (lags typing slightly while React catches up). */
  settledQuery: string;
  /** True when the settled query has at least one searchable word. */
  searching: boolean;
  results: SearchResult[];
  /** Entries under the active filter, for browsing before typing. */
  browse: JournalEntry[];
  /** Example queries that find something in this journal. */
  suggestions: string[];
  /** Whether the current query would find something with the "All" filter. */
  matchesWithoutFilter: boolean;
}

/**
 * Search state for the Search screen: one index per journal and language
 * (labels included, so "Dreams" / "Sueños" find dream entries), queried with a
 * deferred value so typing stays smooth.
 */
export function useJournalSearch(query: string, filter: SearchFilter): JournalSearch {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries } = useJournal();

  const labelFor = useCallback(
    (entry: JournalEntry) =>
      entry.subcategory
        ? [categoryLabel(t, entry.category), situationLabel(t, entry.subcategory)]
        : categoryLabel(t, entry.category),
    [t],
  );
  const index = useMemo(
    () => createSearchIndex(savedEntries, { language, labelFor }),
    [savedEntries, language, labelFor],
  );

  const settledQuery = useDeferredValue(query);
  const searching = parseQuery(settledQuery).terms.length > 0;
  const results = useMemo(
    () => (searching ? searchIndex(index, settledQuery, { filter }) : []),
    [index, searching, settledQuery, filter],
  );
  const matchesWithoutFilter = useMemo(
    () => searching && filter !== 'all' && results.length === 0 && hasMatches(index, settledQuery),
    [index, searching, settledQuery, filter, results.length],
  );
  const browse = useMemo(
    () => (filter === 'all' ? [] : filterEntries(savedEntries, filter, language)),
    [savedEntries, filter, language],
  );

  const suggestions = useMemo(() => {
    const curated = toStringList(t('search.suggestions', { returnObjects: true, defaultValue: [] }));
    // The reader's own titles back up the curated examples ("Blue boat", "Three lighthouses").
    const titles = savedEntries.map((entry) => resolveContent(entry, language).title ?? '');
    return suggestQueries(index, [...curated, ...titles], MAX_SUGGESTIONS);
  }, [t, index, savedEntries, language]);

  return { settledQuery, searching, results, browse, suggestions, matchesWithoutFilter };
}
