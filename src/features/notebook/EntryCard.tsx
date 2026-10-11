import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
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

import { categoryByKey, lifeSituations } from '../../../brand/categories';
import { entryCategoryLabel } from '../../lib/categoryCopy';
import { formatDate, formatTime } from '../../lib/dates';
import type { HighlightRange } from '../../lib/search';
import { entryTitle, resolveContent, useSettings, type JournalEntry } from '../../state';
import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { AppText, glass, glassBlur, Icon, PressableScale } from '../../ui';
import { entryImage } from '../../ui/art/images';
import { HighlightedText } from './HighlightedText';

export interface EntryExcerpt {
  text: string;
  highlights: readonly HighlightRange[];
}

export interface EntryCardProps {
  entry: JournalEntry;
  /** 'full': painting, date, category, title and excerpt. 'compact': a smaller row for a day list. */
  variant?: 'full' | 'compact';
  /** A search excerpt with highlights; otherwise the card shows the opening of `body`. */
  excerpt?: EntryExcerpt;
  /** What the card quotes without a search excerpt: the entry text, or the reader's note (Notes filter). */
  body?: 'text' | 'note';
  /** Replaces the chevron, e.g. the heart on Saved. */
  action?: ReactNode;
  /** Position in its list, for the staggered entrance. */
  index?: number;
  /** Set (and changed) each time the card should play its "just saved" glow. */
  highlightNonce?: number;
  onHighlightPlayed?: (nonce: number) => void;
  testID?: string;
}

/** The icon for an entry: its life situation's when it has one, else its category's. */
export function entryIconName(entry: Pick<JournalEntry, 'category' | 'subcategory'>): string {
  if (entry.category === 'life' && entry.subcategory) {
    const situation = lifeSituations.find((s) => s.key === entry.subcategory);
    if (situation) return situation.icon;
  }
  return categoryByKey(entry.category).icon;
}

/**
 * Design 4 result card, shared by Search, the Notebook, Saved and the
 * Calendar. Shows the entry's painting, its date (and time only when the
 * reader saved one), its category, its title and an excerpt; opens the entry.
 */
export function EntryCard({
  entry,
  variant = 'full',
  excerpt,
  body = 'text',
  action,
  index = 0,
  highlightNonce,
  onHighlightPlayed,
  testID,
}: EntryCardProps) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const compact = variant === 'compact';

  const title = entryTitle(entry, language);
  const category = entryCategoryLabel(t, entry);
  const icon = entryIconName(entry);
  const when = new Date(entry.createdAt);
  const date = formatDate(when, language);
  const time = entry.hasTime ? formatTime(when, language) : undefined;

  // A gold wash that settles over ~1.5 s, played when the Reading screen sends the reader here.
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

  const content = resolveContent(entry, language);
  const opening = (body === 'note' && content.note?.trim()) || content.text;
  const whenLabel = compact ? time : [date, time].filter(Boolean).join(', ');
  const a11yLabel = [title, category, whenLabel, entry.favorite ? t('notebook.card.favorite') : undefined]
    .filter(Boolean)
    .join('. ');

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 6) * 50)}>
      <PressableScale
        onPress={() => router.push(`/entry/${entry.id}`)}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={t('notebook.card.openHint')}
        testID={testID}
        style={[glass.card, glassBlur, compact ? styles.compactCard : styles.card]}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <View style={compact ? styles.thumbSmall : styles.thumb}>
          <Image
            source={entryImage(entry)}
            contentFit="cover"
            transition={200}
            accessible={false}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {compact ? (
          <View style={styles.compactBody}>
            <AppText style={styles.compactTitle} numberOfLines={2}>
              {title}
            </AppText>
            <View style={styles.compactMeta}>
              <View style={styles.iconBox}>
                <Icon name={icon} size={14} color={colors.gold} strokeWidth={1.8} />
              </View>
              <AppText style={styles.metaText} numberOfLines={1}>
                {time ? `${time} · ${category}` : category}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.metaRow}>
              <View style={styles.dateRow}>
                <AppText style={styles.metaText} numberOfLines={1}>
                  {time ? `${date} · ${time}` : date}
                </AppText>
                {entry.favorite && !action ? (
                  <View style={styles.iconBox}>
                    <Icon name="Heart" size={12} color={colors.roseDeep} fill={colors.roseDeep} strokeWidth={1.8} />
                  </View>
                ) : null}
              </View>
              <View style={styles.tag}>
                <View style={styles.iconBox}>
                  <Icon name={icon} size={15} color={colors.gold} strokeWidth={1.8} />
                </View>
                <AppText style={styles.tagText} numberOfLines={1}>
                  {category}
                </AppText>
              </View>
            </View>
            <AppText style={styles.title} numberOfLines={2}>
              {title}
            </AppText>
            {excerpt ? (
              <HighlightedText
                text={excerpt.text}
                highlights={excerpt.highlights}
                style={styles.excerpt}
                numberOfLines={6}
              />
            ) : (
              <AppText style={styles.excerpt} numberOfLines={3}>
                {opening}
              </AppText>
            )}
          </View>
        )}

        {/* Wrapped: a bare web <svg> would paint under the absolutely positioned glow. */}
        <View style={styles.trailing}>
          {action ?? <Icon name="ChevronRight" size={20} color={colors.muted} strokeWidth={1.75} />}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const THUMB_WIDTH = 92;
const THUMB_SMALL = 60;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.sm,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm + 2,
    paddingRight: spacing.sm,
    borderRadius: radius.md + 2,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(colors.goldLight, 0.4),
    pointerEvents: 'none',
  },
  // Portrait painting that grows with the text beside it, as in Design 4.
  thumb: {
    width: THUMB_WIDTH,
    minHeight: 112,
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.lavenderSoft,
  },
  thumbSmall: {
    width: THUMB_SMALL,
    height: THUMB_SMALL,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.lavenderSoft,
  },
  body: { flex: 1, gap: 5, paddingVertical: 2 },
  // The category drops under the date when both do not fit.
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: spacing.sm,
    rowGap: 2,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  metaText: {
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  tagText: {
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.goldDeep,
  },
  iconBox: { flexShrink: 0 },
  // Lining figures: Cormorant's default old-style digits turn "11:11" into small caps.
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.1,
    color: colors.plumDeep,
    fontVariant: ['lining-nums'],
  },
  excerpt: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  compactBody: { flex: 1, gap: 3 },
  compactTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    color: colors.plumDeep,
    fontVariant: ['lining-nums'],
  },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trailing: { flexShrink: 0, alignSelf: 'center', paddingLeft: 2 },
});
