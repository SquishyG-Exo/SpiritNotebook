import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { categoryByKey, type CategoryKey } from '../../../brand/categories';
import type { SearchFilter } from '../../lib/search';
import { colors, spacing } from '../../theme';
import { Button, Icon } from '../../ui';
import { EmptyState } from './EmptyState';

/** Opens the composer for a category (Life Situations first asks which situation). */
export function openComposer(category: CategoryKey) {
  if (categoryByKey(category).hasSubcategories) router.push(`/explore/${category}`);
  else router.push({ pathname: '/entry/new', params: { category } });
}

/** A filter chip with nothing under it: say so kindly, and offer to log one in that category. */
export function FilterEmpty({ filter, label }: { filter: Exclude<SearchFilter, 'all'>; label: string }) {
  const { t } = useTranslation();
  if (filter === 'notes') {
    return (
      <EmptyState
        icon="NotebookPen"
        title={t('notebook.empty.notesTitle')}
        hint={t('notebook.empty.notesHint')}
        testID="filter-empty"
      />
    );
  }
  return (
    <EmptyState
      icon={categoryByKey(filter).icon}
      title={t('notebook.empty.filterTitle', { filter: label })}
      hint={t('notebook.empty.filterHint')}
      testID="filter-empty">
      <Button
        label={t('notebook.empty.logCategory')}
        size="md"
        fullWidth={false}
        icon={<Icon name="Plus" size={18} color={colors.white} strokeWidth={2.2} />}
        onPress={() => openComposer(filter)}
        style={styles.button}
      />
    </EmptyState>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'center', marginTop: spacing.xs },
});
