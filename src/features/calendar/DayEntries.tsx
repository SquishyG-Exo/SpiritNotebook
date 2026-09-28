import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { formatLongDate, parseDateKey } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';
import { colors, radius, spacing } from '../../theme';
import { AppText, Button, Icon, IconCircle, PressableScale } from '../../ui';
import { EntryRow } from './EntryRow';

export interface DayEntriesProps {
  dayKey: string;
  todayKey: string;
  entries: readonly JournalEntry[];
  language: Language;
  /** Remounts (and re-animates) the list when it changes. */
  listKey: string;
  highlight?: { id: string; nonce: number };
  onHighlightPlayed: (nonce: number) => void;
  /** Offered from an empty day, e.g. jumps to the most recent day with entries. */
  onShowLatest?: () => void;
}

/** "Entries on …" heading plus the day's saved entries, or a gentle empty state. */
export function DayEntries({
  dayKey,
  todayKey,
  entries,
  language,
  listKey,
  highlight,
  onHighlightPlayed,
  onShowLatest,
}: DayEntriesProps) {
  const { t } = useTranslation();
  const date = formatLongDate(parseDateKey(dayKey), language);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="subheading" style={styles.heading} accessibilityRole="header">
          {t('calendar.entriesOn', { date })}
        </AppText>
        {entries.length > 0 ? (
          <AppText variant="caption" color={colors.muted}>
            {t('calendar.entryCount', { count: entries.length })}
          </AppText>
        ) : null}
      </View>

      <Animated.View key={listKey} entering={FadeIn.duration(180)} style={styles.list}>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              language={language}
              index={index}
              highlightNonce={highlight?.id === entry.id ? highlight.nonce : undefined}
              onHighlightPlayed={onHighlightPlayed}
            />
          ))
        ) : (
          <EmptyDay future={dayKey > todayKey} onShowLatest={onShowLatest} />
        )}
      </Animated.View>
    </View>
  );
}

function EmptyDay({ future, onShowLatest }: { future: boolean; onShowLatest?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.empty}>
      <IconCircle name={future ? 'Moon' : 'PenLine'} size={48} tint={colors.roseSoft} color={colors.roseDeep} />
      <View style={styles.emptyText}>
        <AppText variant="bodyMedium" align="center">
          {future ? t('calendar.futureDay') : t('calendar.emptyDay')}
        </AppText>
        <AppText variant="small" color={colors.muted} align="center">
          {future ? t('calendar.futureDayHint') : t('calendar.emptyDayHint')}
        </AppText>
      </View>
      {future ? null : (
        <Button
          label={t('common.actions.newEntry')}
          variant="secondary"
          size="md"
          fullWidth={false}
          icon={<Icon name="Plus" size={18} color={colors.roseDeep} strokeWidth={2} />}
          onPress={() => router.push('/explore')}
          style={styles.emptyButton}
        />
      )}
      {onShowLatest ? (
        <PressableScale
          onPress={onShowLatest}
          scaleTo={0.96}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.latest}>
          <AppText variant="smallMedium" color={colors.lavenderDeep}>
            {t('calendar.latestEntry')}
          </AppText>
          <Icon name="ChevronRight" size={16} color={colors.lavenderDeep} strokeWidth={2} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl, gap: spacing.md },
  // The count sits beside the heading, or wraps beneath it when the date is long.
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: spacing.md,
    rowGap: 2,
  },
  heading: { flexShrink: 1 },
  list: { gap: spacing.md },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceTint,
  },
  emptyText: { gap: spacing.xs, maxWidth: 300 },
  emptyButton: { alignSelf: 'center', marginTop: spacing.xs },
  latest: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: spacing.xs },
});
