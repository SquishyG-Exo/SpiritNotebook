import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { categoryByKey } from '../../../brand/categories';
import { formatTime } from '../../lib/dates';
import { resolveContent, type JournalEntry, type Language } from '../../state';
import { colors, radius, shadow, spacing } from '../../theme';
import { AppText, Chip, Icon, IconCircle, PressableScale } from '../../ui';
import { excerpt } from './calendarModel';
import { entryCategoryLabel } from './categoryLabels';

export interface EntryRowProps {
  entry: JournalEntry;
  language: Language;
  /** Position in the list, used to stagger the entrance. */
  index: number;
  /** Set (and changed) each time this row should play its "just saved" highlight. */
  highlightNonce?: number;
  onHighlightPlayed?: (nonce: number) => void;
}

/** One saved entry for the selected day: category icon, title, time, sample chip. */
export function EntryRow({ entry, language, index, highlightNonce, onHighlightPlayed }: EntryRowProps) {
  const { t } = useTranslation();
  const content = resolveContent(entry, language);
  const title = content.reading?.title?.trim() || excerpt(content.text) || t('calendar.untitled');
  const def = categoryByKey(entry.category);
  const time = formatTime(new Date(entry.createdAt), language);
  const category = entryCategoryLabel(t, entry);

  // Rose wash that settles over ~1.5 s after the Reading screen sends us here.
  const glow = useSharedValue(0);
  useEffect(() => {
    if (highlightNonce === undefined) return;
    glow.set(
      withSequence(
        withTiming(1, { duration: 240 }),
        withDelay(500, withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) })),
      ),
    );
    onHighlightPlayed?.(highlightNonce);
  }, [highlightNonce, glow, onHighlightPlayed]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() }));

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 6) * 60)}>
      <PressableScale
        onPress={() => router.push(`/entry/${entry.id}`)}
        accessibilityRole="button"
        accessibilityLabel={t('calendar.openEntry', { title, time, category })}
        style={styles.row}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <IconCircle name={def.icon} size={46} tint={def.tint} color={def.accent} />
        <View style={styles.body}>
          <AppText variant="subheading" numberOfLines={1}>
            {title}
          </AppText>
          <View style={styles.meta}>
            <AppText variant="caption" color={colors.muted} numberOfLines={1} style={styles.metaText}>
              {`${time} · ${category}`}
            </AppText>
            {entry.isSample ? <Chip label={t('common.sample')} tone="lavender" style={styles.chip} /> : null}
          </View>
        </View>
        {/* Wrapped: a bare web <svg> would paint under the absolutely positioned glow. */}
        <View style={styles.chevron}>
          <Icon name="ChevronRight" size={20} color={colors.faint} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    ...shadow.card,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.lg,
    backgroundColor: colors.roseSoft,
    pointerEvents: 'none',
  },
  body: { flex: 1, gap: 3 },
  // The Sample chip drops to its own line rather than clipping a long category.
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: 4 },
  metaText: { flexShrink: 1 },
  chip: { paddingVertical: 1, paddingHorizontal: spacing.sm, flexShrink: 0 },
  chevron: { flexShrink: 0 },
});
