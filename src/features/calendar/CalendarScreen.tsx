import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { dateKey } from '../../lib/dates';
import { useJournal, useSettings } from '../../state';
import { colors, layout, radius, shadow, spacing } from '../../theme';
import { AppText, Icon, PressableScale, Screen } from '../../ui';
import { Butterfly, DreamBanner, EnergyField, Sparkles, type SparkleSpec } from '../../ui/art';
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

/** Header art: a slim dawn strip; the title block sits on its faded lower part. */
const BANNER_HEIGHT = 136;
/** Kept to the upper band and the right edge, clear of the title and the Today pill. */
const BANNER_SPARKLES: SparkleSpec[] = [
  { x: 0.08, y: 0.16, size: 10, delay: 0 },
  { x: 0.46, y: 0.12, size: 8, delay: 900 },
  { x: 0.93, y: 0.52, size: 9, delay: 1600 },
];
/** Soft lavender glow the month card floats on (static: it sits behind a card). */
const MONTH_GLOW = 640;

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
      <DreamBanner
        variant="dawn"
        height={BANNER_HEIGHT}
        butterflies="none"
        sparkles={false}
        style={styles.banner}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Sparkles sparkles={BANNER_SPARKLES} />
          <Butterfly size={46} rotation={-16} style={styles.butterflyLarge} />
          <Butterfly
            size={28}
            rotation={22}
            delay={900}
            colorA={colors.peach}
            colorB={colors.rose}
            opacity={0.75}
            style={styles.butterflySmall}
          />
        </View>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header" numberOfLines={1}>
            {t('calendar.title')}
          </AppText>
          <View style={styles.subRow}>
            <AppText variant="small" color={colors.inkSoft} style={styles.summary} numberOfLines={1}>
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
      </DreamBanner>

      <View>
        <EnergyField
          size={MONTH_GLOW}
          color={colors.lavender}
          intensity={0.3}
          animated={false}
          style={styles.monthGlow}
        />
        <MonthCalendar
          month={visibleMonth}
          language={language}
          selectedKey={selectedKey}
          todayKey={todayKey}
          entriesByDay={entriesByDay}
          onSelectDay={selectDay}
          onChangeMonth={changeMonth}
        />
        <Butterfly
          size={30}
          rotation={-28}
          opacity={0.55}
          animated={false}
          colorA={colors.lavender}
          colorB={colors.rose}
          style={styles.restingButterfly}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Full-bleed (undo the Screen gutter), and above the month glow so it never tints the title.
  banner: { marginHorizontal: -layout.gutter, zIndex: 1 },
  butterflyLarge: { position: 'absolute', right: 18, top: 12 },
  butterflySmall: { position: 'absolute', left: '58%', top: 14 },
  header: { paddingHorizontal: layout.gutter, paddingBottom: spacing.md },
  // Fixed height so the Today pill can come and go without moving the page.
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 32 },
  summary: { flex: 1 },
  // White on the artwork so it reads as a control, not part of the scenery.
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
    height: 30,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lavenderSoft,
    ...shadow.card,
  },
  monthGlow: { left: '50%', top: '50%', marginLeft: -MONTH_GLOW / 2, marginTop: -MONTH_GLOW / 2 },
  // Resting on the card's bottom-right corner, clear of the day grid.
  restingButterfly: { position: 'absolute', right: -6, bottom: -14 },
});
