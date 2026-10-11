import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, type TextInput } from 'react-native';

import type { SearchFilter } from '../../lib/search';
import { useJournal, type JournalEntry } from '../../state';
import { spacing } from '../../theme';
import { goBackOrHome } from '../../ui';
import { firstParam } from '../calendar/calendarModel';
import { EntryCard, type EntryExcerpt } from '../notebook/EntryCard';
import { FilterChips, filterLabel, useFilterOptions } from '../notebook/FilterChips';
import { FilterEmpty } from '../notebook/FilterEmpty';
import { SectionHeader } from '../notebook/SectionHeader';
import { ProfileButton, SkyHeader } from '../notebook/SkyHeader';
import { SkyPage, skyPage, useSkyPadding } from '../notebook/SkyPage';
import { NoResults, SearchSuggestions } from './SearchSuggestions';
import { SearchField } from './SearchField';
import { useJournalSearch } from './useJournalSearch';

/** Recent entries shown under the suggestions before the reader types. */
const RECENT_COUNT = 3;

interface Row {
  entry: JournalEntry;
  excerpt?: EntryExcerpt;
}

/**
 * Search (Design 4): find saved dreams, signs and notes by the words the
 * reader remembers. `/search?q=blue%20boat` opens with the query filled in.
 */
export function SearchScreen() {
  const { t } = useTranslation();
  const { savedEntries } = useJournal();
  const padding = useSkyPadding('stack');
  const options = useFilterOptions();
  const inputRef = useRef<TextInput>(null);

  const params = useLocalSearchParams<{ q?: string | string[] }>();
  const paramQuery = firstParam(params.q) ?? '';
  const [query, setQuery] = useState(paramQuery);
  const [filter, setFilter] = useState<SearchFilter>('all');
  // A new ?q= while the screen stays mounted replaces the query (adjusted during render).
  const [appliedParam, setAppliedParam] = useState(paramQuery);
  if (appliedParam !== paramQuery) {
    setAppliedParam(paramQuery);
    setQuery(paramQuery);
  }

  const { settledQuery, searching, results, browse, suggestions, matchesWithoutFilter } = useJournalSearch(
    query,
    filter,
  );

  const clear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);
  const pick = useCallback((suggestion: string) => setQuery(suggestion), []);
  const widen = useCallback(() => setFilter('all'), []);

  const browsing = !searching && filter !== 'all';
  const rows: Row[] = searching
    ? results.map((r) => ({ entry: r.entry, excerpt: { text: r.excerpt, highlights: r.highlights } }))
    : browsing
      ? browse.map((entry) => ({ entry }))
      : savedEntries.slice(0, RECENT_COUNT).map((entry) => ({ entry }));
  const activeLabel = filterLabel(options, filter);

  // An element (not a component) so the field keeps focus while the list re-renders.
  const header = (
    <View>
      <SkyHeader
        title={t('search.title')}
        subtitle={t('search.subtitle')}
        onBack={goBackOrHome}
        right={<ProfileButton />}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onClear={clear}
          placeholder={t('search.placeholder')}
          label={t('search.fieldLabel')}
          clearLabel={t('search.clear')}
          autoFocus={!paramQuery}
          inputRef={inputRef}
        />
        <FilterChips options={options} value={filter} onChange={setFilter} />
      </SkyHeader>

      <View style={styles.section}>
        {searching ? (
          <SectionHeader
            title={t('search.resultsTitle')}
            meta={t('search.resultCount', { count: results.length })}
            live
          />
        ) : browsing ? (
          <SectionHeader
            title={t('search.browseTitle', { filter: activeLabel })}
            meta={t('search.entryCount', { count: browse.length })}
          />
        ) : (
          <>
            <SearchSuggestions suggestions={suggestions} onPick={pick} />
            {rows.length > 0 ? <SectionHeader title={t('search.recentTitle')} style={styles.recent} /> : null}
          </>
        )}
      </View>
    </View>
  );

  const empty = searching ? (
    <NoResults
      query={settledQuery}
      filterName={matchesWithoutFilter ? activeLabel : undefined}
      onWiden={matchesWithoutFilter ? widen : undefined}
    />
  ) : filter !== 'all' ? (
    <FilterEmpty filter={filter} label={activeLabel} />
  ) : null;

  return (
    <SkyPage>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.entry.id}
        renderItem={({ item, index }) => (
          <EntryCard
            entry={item.entry}
            excerpt={item.excerpt}
            body={filter === 'notes' ? 'note' : 'text'}
            index={index}
            testID={`result-${item.entry.id}`}
          />
        )}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        style={skyPage.scroll}
        contentContainerStyle={[skyPage.content, padding]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </SkyPage>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl, marginBottom: spacing.md, gap: spacing.md },
  recent: { marginTop: spacing.lg },
  gap: { height: spacing.md },
});
