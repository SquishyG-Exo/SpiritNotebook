import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, StyleSheet, View } from 'react-native';

import { filterEntries, type SearchFilter } from '../../lib/search';
import { useJournal, useSettings } from '../../state';
import { colors, spacing } from '../../theme';
import { Button, Icon } from '../../ui';
import { EmptyState } from './EmptyState';
import { EntryCard } from './EntryCard';
import { FilterChips, filterLabel, useFilterOptions } from './FilterChips';
import { FilterEmpty } from './FilterEmpty';
import { groupByMonth } from './notebookModel';
import { PatternsCard } from './PatternsCard';
import { SearchPill } from './SearchPill';
import { SectionHeader } from './SectionHeader';
import { ProfileButton, SkyHeader } from './SkyHeader';
import { SkyPage, skyPage, useSkyPadding } from './SkyPage';

/**
 * My Notebook (tab): every saved entry by month, newest first, with a search
 * pill, the Premium patterns card and category filters.
 */
export function NotebookScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries } = useJournal();
  const padding = useSkyPadding('tab');
  const options = useFilterOptions();
  const [filter, setFilter] = useState<SearchFilter>('all');

  const sections = useMemo(
    () => groupByMonth(filterEntries(savedEntries, filter, language), language),
    [savedEntries, filter, language],
  );

  const header = (
    <View>
      <SkyHeader
        title={t('notebook.title')}
        subtitle={t('notebook.count', { count: savedEntries.length })}
        right={<ProfileButton />}>
        <SearchPill label={t('notebook.searchPlaceholder')} />
      </SkyHeader>
      <View style={styles.tools}>
        <PatternsCard />
        {savedEntries.length > 0 ? <FilterChips options={options} value={filter} onChange={setFilter} /> : null}
      </View>
    </View>
  );

  const empty =
    savedEntries.length === 0 ? (
      <EmptyState icon="BookOpen" title={t('notebook.empty.title')} hint={t('notebook.empty.hint')}>
        <Button
          label={t('common.actions.newEntry')}
          size="md"
          fullWidth={false}
          icon={<Icon name="Plus" size={18} color={colors.white} strokeWidth={2.2} />}
          onPress={() => router.push('/explore')}
          style={styles.button}
        />
      </EmptyState>
    ) : filter !== 'all' ? (
      <View style={styles.filterEmpty}>
        <FilterEmpty filter={filter} label={filterLabel(options, filter)} />
      </View>
    ) : null;

  return (
    <SkyPage>
      <SectionList
        sections={sections}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item, index }) => (
          <EntryCard
            entry={item}
            index={index}
            body={filter === 'notes' ? 'note' : 'text'}
            testID={`notebook-${item.id}`}
          />
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            title={section.title}
            meta={t('notebook.monthCount', { count: section.data.length })}
            style={styles.month}
          />
        )}
        ItemSeparatorComponent={Gap}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        style={skyPage.scroll}
        contentContainerStyle={[skyPage.content, padding]}
        showsVerticalScrollIndicator={false}
      />
    </SkyPage>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  tools: { marginTop: spacing.xl, marginBottom: spacing.sm, gap: spacing.lg },
  month: { marginTop: spacing.xl, marginBottom: spacing.md },
  gap: { height: spacing.md },
  button: { alignSelf: 'center', marginTop: spacing.xs },
  filterEmpty: { marginTop: spacing.md },
});
