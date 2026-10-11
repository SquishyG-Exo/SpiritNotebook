import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addDays, dateKey, formatLongDate, formatMonthYear, startOfDay, weekdayInitials } from '../../lib/dates';
import type { Language } from '../../state';
import { colors, fonts, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { pressedProp, RoundButton } from './scenery';
import {
  buildMonthGrid,
  capitalizeFirst,
  firstOfMonth,
  monthOf,
  sameMonth,
  shiftMonth,
  type DayCell,
  type MonthRef,
} from './when';

const DISC = 40;

export interface DateSheetProps {
  value: Date;
  now: Date;
  language: Language;
  onSelect: (day: Date) => void;
  onClose: () => void;
}

/**
 * "When did it happen?": a bottom sheet with a month calendar. Today and past
 * days only. Laid over the screen (not a native Modal) so it stays inside the
 * desktop phone frame on the web.
 */
export function DateSheet({ value, now, language, onSelect, onClose }: DateSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState<MonthRef>(() => monthOf(value));
  const thisMonth = monthOf(now);
  const atCurrentMonth = sameMonth(month, thisMonth);
  // Only the weeks that hold days of this month (a sheet may change height by a row; nothing jumps above it).
  const weeks = useMemo(() => buildMonthGrid(month, now).filter((week) => week.some((cell) => cell.inMonth)), [month, now]);
  const initials = useMemo(() => weekdayInitials(language), [language]);
  const selectedKey = dateKey(value);
  const todayKey = dateKey(now);
  const yesterday = addDays(startOfDay(now), -1);

  // Hardware back (Android) and Escape (web) close the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    let removeKey: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKey);
      removeKey = () => document.removeEventListener('keydown', onKey);
    }
    return () => {
      sub.remove();
      removeKey?.();
    };
  }, [onClose]);

  return (
    <View style={StyleSheet.absoluteFill} testID="date-sheet">
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(160)} style={StyleSheet.absoluteFill}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('entry.when.close')}
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(320)}
        exiting={SlideOutDown.duration(220)}
        role="dialog"
        aria-modal
        accessibilityViewIsModal
        aria-label={t('entry.when.sheetTitle')}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm }]}>
        <View style={styles.grabber} />

        <View style={styles.header}>
          <AppText variant="heading" color={colors.plum} accessibilityRole="header" style={styles.headerTitle}>
            {t('entry.when.sheetTitle')}
          </AppText>
          <RoundButton icon="X" label={t('entry.when.close')} onPress={onClose} size={38} testID="date-sheet-close" />
        </View>

        <View style={styles.quick}>
          <QuickChip
            label={t('entry.when.today')}
            selected={selectedKey === todayKey}
            onPress={() => onSelect(startOfDay(now))}
            testID="date-today"
          />
          <QuickChip
            label={t('entry.when.yesterday')}
            selected={selectedKey === dateKey(yesterday)}
            onPress={() => onSelect(yesterday)}
            testID="date-yesterday"
          />
        </View>

        <View style={styles.nav}>
          <NavButton icon="ChevronLeft" label={t('entry.when.previousMonth')} onPress={() => setMonth((m) => shiftMonth(m, -1))} />
          <Animated.View key={`${month.year}-${month.month}`} entering={FadeIn.duration(200)} style={styles.navTitle}>
            <AppText variant="heading" align="center" numberOfLines={1} style={styles.monthTitle} accessibilityLiveRegion="polite">
              {capitalizeFirst(formatMonthYear(firstOfMonth(month), language))}
            </AppText>
          </Animated.View>
          <NavButton
            icon="ChevronRight"
            label={t('entry.when.nextMonth')}
            onPress={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={atCurrentMonth}
          />
        </View>

        <View style={styles.weekdays} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {initials.map((label, i) => (
            <AppText key={`${label}-${i}`} variant="caption" color={colors.muted} align="center" style={styles.weekday}>
              {label}
            </AppText>
          ))}
        </View>

        {weeks.map((week) => (
          <View key={week[0].key} style={styles.week}>
            {week.map((cell) => (
              <DayButton
                key={cell.key}
                cell={cell}
                selected={cell.key === selectedKey}
                isToday={cell.key === todayKey}
                label={dayA11yLabel(t, cell, language, cell.key === todayKey)}
                onSelect={onSelect}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function dayA11yLabel(t: ReturnType<typeof useTranslation>['t'], cell: DayCell, language: Language, isToday: boolean) {
  const date = formatLongDate(cell.date, language);
  if (cell.future) return t('entry.when.futureDay', { date });
  return isToday ? `${t('entry.when.today')}, ${date}` : date;
}

function QuickChip({ label, selected, onPress, testID }: { label: string; selected: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...pressedProp(selected)}
      testID={testID}
      style={({ pressed }) => [styles.chip, selected ? styles.chipOn : null, pressed ? styles.pressed : null]}>
      <AppText variant="smallMedium" color={selected ? colors.white : colors.plum}>
        {label}
      </AppText>
    </Pressable>
  );
}

function NavButton({ icon, label, onPress, disabled }: { icon: string; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.navButton, disabled ? styles.navDisabled : null]}>
      <Icon name={icon} size={20} color={colors.plum} strokeWidth={2} />
    </PressableScale>
  );
}

interface DayButtonProps {
  cell: DayCell;
  selected: boolean;
  isToday: boolean;
  label: string;
  onSelect: (day: Date) => void;
}

const DayButton = memo(function DayButton({ cell, selected, isToday, label, onSelect }: DayButtonProps) {
  if (!cell.inMonth) return <View style={styles.cell} />;
  const disabled = cell.future;
  const color = selected ? colors.white : disabled ? withAlpha(colors.muted, 0.45) : isToday ? colors.goldDeep : colors.ink;

  return (
    <PressableScale
      onPress={() => onSelect(startOfDay(cell.date))}
      disabled={disabled}
      scaleTo={0.88}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      {...pressedProp(selected)}
      testID={`date-day-${cell.key}`}
      style={styles.cell}>
      <View style={[styles.disc, isToday && !selected ? styles.todayRing : null, selected ? styles.selectedDisc : null]}>
        <AppText variant="smallMedium" color={color} style={[styles.dayNumber, isToday || selected ? styles.dayStrong : null]}>
          {cell.day}
        </AppText>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha(colors.plumDeep, 0.38),
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...shadow.lifted,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: withAlpha(colors.muted, 0.3),
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingLeft: spacing.xs,
  },
  headerTitle: {
    flex: 1,
  },
  quick: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingLeft: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: withAlpha(colors.plum, 0.22),
    backgroundColor: colors.white,
  },
  chipOn: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  pressed: { opacity: 0.7 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  navTitle: { flex: 1, paddingHorizontal: spacing.xs },
  monthTitle: { fontSize: 21, lineHeight: 26, fontVariant: ['lining-nums'] },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  navDisabled: { opacity: 0.35 },
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
  todayRing: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  selectedDisc: {
    backgroundColor: colors.plum,
    ...shadow.soft,
  },
  dayNumber: { fontSize: 15, lineHeight: 18 },
  dayStrong: { fontFamily: fonts.bodySemiBold },
});
