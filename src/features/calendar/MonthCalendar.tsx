import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { formatLongDate, formatMonthYear, weekdayInitials } from '../../lib/dates';
import type { JournalEntry, Language } from '../../state';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import {
  buildMonthGrid,
  capitalizeFirst,
  firstOfMonth,
  monthKey,
  type DayCell,
  type MonthRef,
} from './calendarModel';

const DISC = 40;
const MAX_DOTS = 3;

export interface MonthCalendarProps {
  month: MonthRef;
  language: Language;
  selectedKey: string;
  todayKey: string;
  entriesByDay: Map<string, JournalEntry[]>;
  onSelectDay: (cell: DayCell) => void;
  onChangeMonth: (delta: -1 | 1) => void;
}

/** Month navigator, weekday initials and a fixed 6 × 7 day grid, in one card. */
export function MonthCalendar({
  month,
  language,
  selectedKey,
  todayKey,
  entriesByDay,
  onSelectDay,
  onChangeMonth,
}: MonthCalendarProps) {
  const { t } = useTranslation();
  const weeks = useMemo(() => buildMonthGrid(month), [month]);
  const initials = useMemo(() => weekdayInitials(language), [language]);
  const key = monthKey(month);
  const title = capitalizeFirst(formatMonthYear(firstOfMonth(month), language));

  return (
    <View style={styles.card}>
      <View style={styles.nav}>
        <NavButton icon="ChevronLeft" label={t('calendar.previousMonth')} onPress={() => onChangeMonth(-1)} />
        <Animated.View key={`title-${key}`} entering={FadeIn.duration(240)} style={styles.navTitle}>
          <AppText
            variant="heading"
            align="center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            accessibilityRole="header"
            style={styles.monthTitle}>
            {title}
          </AppText>
        </Animated.View>
        <NavButton icon="ChevronRight" label={t('calendar.nextMonth')} onPress={() => onChangeMonth(1)} />
      </View>

      <View style={styles.weekdays} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {initials.map((label, i) => (
          <AppText key={`${label}-${i}`} variant="caption" color={colors.muted} align="center" style={styles.weekday}>
            {label}
          </AppText>
        ))}
      </View>

      <Animated.View key={`grid-${key}`} entering={FadeIn.duration(260)}>
        {weeks.map((week) => (
          <View key={week[0].key} style={styles.week}>
            {week.map((cell) => (
              <DayButton
                key={cell.key}
                cell={cell}
                count={entriesByDay.get(cell.key)?.length ?? 0}
                selected={cell.key === selectedKey}
                isToday={cell.key === todayKey}
                label={dayLabel(t, cell, language, entriesByDay.get(cell.key)?.length ?? 0, cell.key === todayKey)}
                onSelect={onSelectDay}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function dayLabel(
  t: ReturnType<typeof useTranslation>['t'],
  cell: DayCell,
  language: Language,
  count: number,
  isToday: boolean,
): string {
  const label = t('calendar.dayA11y', { date: formatLongDate(cell.date, language), count });
  return isToday ? t('calendar.todayA11y', { label }) : label;
}

function NavButton({ icon, label, onPress }: { icon: 'ChevronLeft' | 'ChevronRight'; label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.navButton}>
      <Icon name={icon} size={20} color={colors.ink} strokeWidth={2} />
    </PressableScale>
  );
}

interface DayButtonProps {
  cell: DayCell;
  count: number;
  selected: boolean;
  isToday: boolean;
  label: string;
  onSelect: (cell: DayCell) => void;
}

const DayButton = memo(function DayButton({ cell, count, selected, isToday, label, onSelect }: DayButtonProps) {
  const textColor = selected
    ? colors.cream
    : !cell.inMonth
      ? colors.faint
      : isToday
        ? colors.lavenderDeep
        : colors.ink;
  const dotColor = selected ? colors.rose : cell.inMonth ? colors.roseDeep : colors.rose;

  return (
    <PressableScale
      onPress={() => onSelect(cell)}
      scaleTo={0.88}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={styles.cell}>
      <View
        style={[
          styles.disc,
          count > 0 ? (cell.inMonth ? styles.entryDisc : styles.entryDiscMuted) : null,
          isToday && !selected ? styles.todayRing : null,
          selected ? styles.selectedDisc : null,
        ]}>
        <AppText
          variant="smallMedium"
          color={textColor}
          style={[styles.dayNumber, isToday || selected ? styles.dayNumberStrong : null]}>
          {cell.day}
        </AppText>
        {count > 0 ? (
          <View style={styles.dots}>
            {Array.from({ length: Math.min(count, MAX_DOTS) }, (_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: dotColor }]} />
            ))}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    ...shadow.card,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  navTitle: { flex: 1, paddingHorizontal: spacing.xs },
  // Sized so "Septiembre de 2026" fits on a 360 px screen.
  monthTitle: { fontSize: 19, lineHeight: 24 },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  weekdays: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  weekday: { flex: 1 },
  week: { flexDirection: 'row' },
  cell: {
    flex: 1,
    height: DISC + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDisc: { backgroundColor: colors.roseSoft },
  entryDiscMuted: { backgroundColor: colors.surfaceTint },
  todayRing: {
    borderWidth: 1.5,
    borderColor: colors.lavender,
  },
  selectedDisc: {
    backgroundColor: colors.ink,
    ...shadow.soft,
  },
  dayNumber: { fontSize: 15, lineHeight: 18 },
  dayNumberStrong: { fontFamily: fonts.bodySemiBold },
  dots: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    gap: 2,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
