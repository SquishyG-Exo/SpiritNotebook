import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { AppText, Button, Icon, PressableScale } from '../../ui';
import { EmptyState, TextLink } from '../notebook/EmptyState';
import { glassBlur } from '../notebook/glass';
import { SectionHeader } from '../notebook/SectionHeader';

/** Before typing: example queries drawn from this journal, as tappable chips. */
export function SearchSuggestions({ suggestions, onPick }: { suggestions: string[]; onPick: (query: string) => void }) {
  const { t } = useTranslation();
  if (suggestions.length === 0) return null;
  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.block}>
      <SectionHeader title={t('search.suggestionsTitle')} />
      <AppText style={styles.hint}>{t('search.suggestionsHint')}</AppText>
      <View style={styles.chips}>
        {suggestions.map((suggestion) => (
          <PressableScale
            key={suggestion}
            onPress={() => onPick(suggestion)}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityLabel={t('search.suggestionA11y', { query: suggestion })}
            hitSlop={SUGGESTION_SLOP}
            style={[styles.chip, glassBlur]}>
            <View>
              <Icon name="Search" size={14} color={colors.gold} strokeWidth={2} />
            </View>
            <AppText style={styles.chipText}>{suggestion}</AppText>
          </PressableScale>
        ))}
      </View>
    </Animated.View>
  );
}

export interface NoResultsProps {
  query: string;
  /** The active filter's label, when the query finds entries outside that filter. */
  filterName?: string;
  /** Offer "Search all categories". */
  onWiden?: () => void;
}

/** Nothing matched: kind words, a way to widen the search, and a way to log something new. */
export function NoResults({ query, filterName, onWiden }: NoResultsProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="Feather"
      title={t('search.noResultsTitle', { query: query.trim() })}
      hint={filterName ? t('search.noResultsInFilter', { filter: filterName }) : t('search.noResultsHint')}
      testID="search-no-results">
      {onWiden ? <TextLink label={t('search.searchAll')} onPress={onWiden} testID="search-widen" /> : null}
      <Button
        label={t('common.actions.newEntry')}
        size="md"
        fullWidth={false}
        icon={<Icon name="Plus" size={18} color={colors.white} strokeWidth={2.2} />}
        onPress={() => router.push('/explore')}
        style={styles.button}
      />
    </EmptyState>
  );
}

/** 3px past the 38px chip (after its 1px border) on each side: 44px targets that never overlap the 8px row gap. */
const SUGGESTION_SLOP = { top: 4, bottom: 4 };

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
  hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 18, color: colors.plumDeep },
  button: { alignSelf: 'center', marginTop: spacing.xs, borderWidth: 1, borderColor: withAlpha(colors.white, 0.2) },
});
