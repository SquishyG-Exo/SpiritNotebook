import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { dateKey } from '../../lib/dates';
import { useJournal, useSettings } from '../../state';
import { colors, radius, spacing } from '../../theme';
import { AppText, Icon, PressableScale, Screen } from '../../ui';
import {
  countInMonth,
  firstOfMonth,
  firstParam,
  formatMonthName,
  groupByDay,
  isDateKey,
  latestEntryDayInMonth,
  monthKey,
  monthOf,
  monthOfKey,
  shiftMonth,
  type DayCell,
} from './calendarModel';
import { DayEntries } from './DayEntries';
import { MonthCalendar } from './MonthCalendar';

type CalendarParams = { date?: string; highlight?: string };

/**
 * Calendar & Journal tab.
 *
 * Route params (sent by the Reading screen after saving):
 *   date=YYYY-MM-DD  shows that month and selects that day
 *   highlight=<id>   briefly highlights that entry's row
 * They are re-applied whenever their values change, even while this tab stays mounted.
 */
export function CalendarScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries, getEntry } = useJournal();

  const params = useLocalSearchParams<CalendarParams>();
  const rawDate = firstParam(params.date);
  const highlightParam = firstParam(params.highlight);
  const highlightEntry = highlightParam ? getEntry(highlightParam) : undefined;
  // `date` wins; a bare `highlight` falls back to the day that entry was written.
  const targetDay = isDateKey(rawDate)
    ? rawDate
    : highlightEntry
      ? dateKey(new Date(highlightEntry.createdAt))
      : undefined;

  const [todayKey] = useState(() => dateKey(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => targetDay ?? todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => monthOfKey(targetDay ?? todayKey));
  const [applied, setApplied] = useState(() => ({
    date: rawDate,
    highlight: highlightParam,
    nonce: highlightParam ? 1 : 0,
  }));
  const [playedNonce, setPlayedNonce] = useState(0);

  // Params changed since we last applied them: adjust state during render
  // (React's recommended alternative to a setState-in-effect).
  if (applied.date !== rawDate || applied.highlight !== highlightParam) {
    setApplied({
      date: rawDate,
      highlight: highlightParam,
      nonce: highlightParam ? applied.nonce + 1 : applied.nonce,
    });
    if (targetDay) {
      setSelectedKey(targetDay);
      setVisibleMonth(monthOfKey(targetDay));
    }
  }

  const entriesByDay = useMemo(() => groupByDay(savedEntries), [savedEntries]);
  const dayEntries = entriesByDay.get(selectedKey) ?? [];
  const currentMonthKey = todayKey.slice(0, 7);
  const monthCount = countInMonth(entriesByDay, visibleMonth);
  const summary =
    monthKey(visibleMonth) === currentMonthKey
      ? t('calendar.monthSummary', { count: monthCount })
      : t('calendar.monthSummaryOther', { count: monthCount, month: formatMonthName(visibleMonth, language) });

  const highlight =
    applied.highlight && applied.nonce > playedNonce ? { id: applied.highlight, nonce: applied.nonce } : undefined;
  const onHighlightPlayed = useCallback((nonce: number) => setPlayedNonce((n) => Math.max(n, nonce)), []);

  const selectDay = useCallback((cell: DayCell) => {
    setSelectedKey(cell.key);
    if (!cell.inMonth) setVisibleMonth(monthOf(cell.date));
  }, []);

  const changeMonth = (delta: -1 | 1) => {
    const next = shiftMonth(visibleMonth, delta);
    setVisibleMonth(next);
    // Land on today, else the latest day with entries, else the 1st.
    setSelectedKey(
      monthKey(next) === currentMonthKey
        ? todayKey
        : (latestEntryDayInMonth(entriesByDay, next) ?? dateKey(firstOfMonth(next))),
    );
  };

  // From an empty today, offer the most recent day that has entries.
  const latestKey = savedEntries.length > 0 ? dateKey(new Date(savedEntries[0].createdAt)) : undefined;
  const showLatest =
    selectedKey === todayKey && dayEntries.length === 0 && latestKey && latestKey < todayKey
      ? () => {
          setSelectedKey(latestKey);
          setVisibleMonth(monthOfKey(latestKey));
        }
      : undefined;

  const goToToday = () => {
    setVisibleMonth(monthOfKey(todayKey));
    setSelectedKey(todayKey);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header" numberOfLines={1}>
          {t('calendar.title')}
        </AppText>
        <View style={styles.subRow}>
          <AppText variant="small" color={colors.muted} style={styles.summary} numberOfLines={1}>
            {summary}
          </AppText>
          {selectedKey !== todayKey ? (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
              <PressableScale
                onPress={goToToday}
                scaleTo={0.94}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('calendar.goToToday')}
                style={styles.todayPill}>
                <Icon name="CalendarDays" size={14} color={colors.lavenderDeep} strokeWidth={2} />
                <AppText variant="caption" color={colors.lavenderDeep}>
                  {t('calendar.today')}
                </AppText>
              </PressableScale>
            </Animated.View>
          ) : null}
        </View>
      </View>

      <MonthCalendar
        month={visibleMonth}
        language={language}
        selectedKey={selectedKey}
        todayKey={todayKey}
        entriesByDay={entriesByDay}
        onSelectDay={selectDay}
        onChangeMonth={changeMonth}
      />

      <DayEntries
        dayKey={selectedKey}
        todayKey={todayKey}
        entries={dayEntries}
        language={language}
        listKey={`${selectedKey}:${applied.nonce}`}
        highlight={highlight}
        onHighlightPlayed={onHighlightPlayed}
        onShowLatest={showLatest}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xl, paddingBottom: spacing.md },
  // Fixed height so the Today pill can come and go without moving the page.
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 32 },
  summary: { flex: 1 },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
    height: 30,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.lavenderSoft,
  },
});
