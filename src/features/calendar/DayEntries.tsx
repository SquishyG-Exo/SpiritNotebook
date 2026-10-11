import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { formatLongDate, parseDateKey } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';
import { colors, fonts, radius, spacing } from '../../theme';
import { AppText, Button, glass, glassBlur, Icon, PressableScale } from '../../ui';
import { EmptyState, TextLink } from '../notebook/EmptyState';
import { EntryCard } from '../notebook/EntryCard';
import { SectionHeader } from '../notebook/SectionHeader';

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

/** Opens "What would you like to log?" with this day preselected for the composer. */
function addEntryFor(dayKey: string) {
  router.push({ pathname: '/explore', params: { date: dayKey } });
}

/** "Entries on …", the day's saved entries and "Add an entry for this day" (today and earlier only). */
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
  const future = dayKey > todayKey;

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('calendar.entriesOn', { date })}
        meta={entries.length > 0 ? t('calendar.entryCount', { count: entries.length }) : undefined}
      />

      <Animated.View key={listKey} entering={FadeIn.duration(180)} style={styles.list}>
        {entries.length > 0 ? (
          <>
            {entries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                variant="compact"
                index={index}
                highlightNonce={highlight?.id === entry.id ? highlight.nonce : undefined}
                onHighlightPlayed={onHighlightPlayed}
                testID={`day-${entry.id}`}
              />
            ))}
            <AddForDay onPress={() => addEntryFor(dayKey)} />
          </>
        ) : future ? (
          <EmptyState icon="Moon" title={t('calendar.futureDay')} hint={t('calendar.futureDayHint')}>
            <Button
              label={t('calendar.addForDay')}
              size="md"
              fullWidth={false}
              disabled
              icon={<Icon name="Plus" size={18} color={colors.white} strokeWidth={2.2} />}
              style={styles.button}
            />
            <AppText style={styles.futureNote} align="center">
              {t('calendar.addFutureHint')}
            </AppText>
          </EmptyState>
        ) : (
          <EmptyState icon="PenLine" title={t('calendar.emptyDay')} hint={t('calendar.emptyDayHint')}>
            <Button
              label={t('calendar.addForDay')}
              size="md"
              fullWidth={false}
              icon={<Icon name="Plus" size={18} color={colors.white} strokeWidth={2.2} />}
              onPress={() => addEntryFor(dayKey)}
              testID="calendar-add"
              style={styles.button}
            />
            {onShowLatest ? <TextLink label={t('calendar.latestEntry')} onPress={onShowLatest} /> : null}
          </EmptyState>
        )}
      </Animated.View>
    </View>
  );
}

/** Glass pill under a day's entries. */
function AddForDay({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={t('calendar.addForDay')}
      testID="calendar-add"
      style={[glass.card, glassBlur, styles.addPill]}>
      <View style={styles.addIcon}>
        <Icon name="Plus" size={16} color={colors.white} strokeWidth={2.4} />
      </View>
      <AppText style={styles.addText}>{t('calendar.addForDay')}</AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl, gap: spacing.md },
  list: { gap: spacing.md },
  button: { alignSelf: 'center', marginTop: spacing.xs },
  futureNote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.pill,
    borderStyle: 'dashed',
    borderColor: colors.plum,
  },
  addIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.plum,
  },
  addText: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 20, color: colors.plum },
});
