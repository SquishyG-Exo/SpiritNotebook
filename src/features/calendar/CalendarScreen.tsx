import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { dateKey } from '../../lib/dates';
import { useJournal, useSettings } from '../../state';
import { colors, fonts, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { ProfileButton, SkyHeader } from '../notebook/SkyHeader';
import { SkyPage, skyPage, useSkyPadding } from '../notebook/SkyPage';
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
 * Calendar tab (Design 4): the month in a glass card, then the selected day's
 * entries and a way to add one for that day.
 *
 * Route params (sent by the Reading screen after saving):
 *   date=YYYY-MM-DD  shows that month and selects that day
 *   highlight=<id>   briefly highlights that entry's card
 * They are re-applied whenever their values change, even while this tab stays mounted.
 */
export function CalendarScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries, getEntry } = useJournal();
  const padding = useSkyPadding('tab');

  const params = useLocalSearchParams<CalendarParams>();
  const rawDate = firstParam(params.date);
  const highlightParam = firstParam(params.highlight);
  const highlightEntry = highlightParam ? getEntry(highlightParam) : undefined;
  // `date` wins; a bare `highlight` falls back to the day that entry happened.
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
    <SkyPage>
      <ScrollView
        style={skyPage.scroll}
        contentContainerStyle={[skyPage.content, padding]}
        showsVerticalScrollIndicator={false}>
        <SkyHeader
          title={t('calendar.title')}
          subtitle={summary}
          left={
            selectedKey !== todayKey ? (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                <PressableScale
                  onPress={goToToday}
                  scaleTo={0.94}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={t('calendar.goToToday')}
                  testID="calendar-today"
                  style={styles.todayPill}>
                  <View>
                    <Icon name="CalendarDays" size={15} color={colors.plum} strokeWidth={1.9} />
                  </View>
                  <AppText style={styles.todayText}>{t('calendar.today')}</AppText>
                </PressableScale>
              </Animated.View>
            ) : null
          }
          right={<ProfileButton />}
        />

        <View style={styles.month}>
          <MonthCalendar
            month={visibleMonth}
            language={language}
            selectedKey={selectedKey}
            todayKey={todayKey}
            entriesByDay={entriesByDay}
            onSelectDay={selectDay}
            onChangeMonth={changeMonth}
          />
        </View>

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
      </ScrollView>
    </SkyPage>
  );
}

const styles = StyleSheet.create({
  month: { marginTop: spacing.xxl },
  // Glass on the violet band, the same family as the header buttons.
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    height: 36,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.white, 0.62),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.tile,
  },
  todayText: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 18, color: colors.plum },
});
