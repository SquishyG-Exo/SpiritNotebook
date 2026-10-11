import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import type { CategoryKey } from '../../../brand/categories';
import { categoryLabel } from '../../lib/categoryCopy';
import type { SearchFilter } from '../../lib/search';
import { colors, fonts, layout, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, PressableScale } from '../../ui';

export interface FilterOption {
  key: SearchFilter;
  label: string;
}

/** Design 4 order: All, Dreams, Signs, Notes, Numbers, then the other categories. */
const AFTER_NOTES: readonly CategoryKey[] = ['numbers', 'animals', 'life', 'words', 'questions', 'gratitude'];

/** Chip labels in the current language (categories through the shared copy helpers). */
export function useFilterOptions(): FilterOption[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { key: 'all', label: t('notebook.filters.all') },
      { key: 'dreams', label: categoryLabel(t, 'dreams') },
      { key: 'signs', label: categoryLabel(t, 'signs') },
      { key: 'notes', label: t('notebook.filters.notes') },
      ...AFTER_NOTES.map((key) => ({ key, label: categoryLabel(t, key) })),
    ],
    [t],
  );
}

/** Label for a filter, e.g. for "Nothing in Dreams yet". */
export function filterLabel(options: readonly FilterOption[], key: SearchFilter): string {
  return options.find((option) => option.key === key)?.label ?? key;
}

export interface FilterChipsProps {
  options: readonly FilterOption[];
  value: SearchFilter;
  onChange: (value: SearchFilter) => void;
}

/** One horizontal row of filter chips that runs edge to edge; the active chip is filled plum. */
export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={t('notebook.filters.label')}
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <PressableScale
            key={option.key}
            onPress={() => onChange(option.key)}
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            testID={`filter-${option.key}`}
            style={[styles.chip, active ? styles.chipActive : null]}>
            <AppText style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Bleeds into the page gutter so chips scroll from edge to edge.
  scroller: { marginHorizontal: -layout.gutter, flexGrow: 0 },
  row: { gap: spacing.sm, paddingHorizontal: layout.gutter, paddingVertical: 2 },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.66),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.tile,
  },
  chipActive: {
    backgroundColor: colors.plum,
    borderColor: withAlpha(colors.plum, 0.9),
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
    color: colors.plumDeep,
  },
  labelActive: { color: colors.white, fontFamily: fonts.bodySemiBold },
});
