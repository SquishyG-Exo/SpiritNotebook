import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import type { Language } from '../../state';
import { colors, fonts, spacing } from '../../theme';
import { AppText } from '../../ui';
import { formatWeekRange, type WeekBucket } from './insightsModel';

const PLOT_HEIGHT = 84;
const BAR_WIDTH = 24;
const ZERO_HEIGHT = 3;
const MIN_HEIGHT = 8;

/**
 * Entries per rolling week, emphasis form: the current week in the accent (rose),
 * earlier weeks in the context hue (lavender). Every bar carries its value on the
 * cap, which is also the contrast relief for the lighter fills.
 */
export function WeeklyBars({ weeks, language }: { weeks: WeekBucket[]; language: Language }) {
  const { t } = useTranslation();
  const max = Math.max(0, ...weeks.map((w) => w.count));

  return (
    <View>
      <View style={styles.plot}>
        {weeks.map((week, index) => {
          const range = formatWeekRange(week.start, week.end, language);
          return (
            <View
              key={range}
              style={styles.column}
              accessible
              accessibilityRole="image"
              accessibilityLabel={t('insights.weekA11y', {
                range: week.isCurrent ? `${t('insights.thisWeek')} (${range})` : range,
                count: week.count,
              })}>
              <AppText variant="caption" color={week.isCurrent ? colors.ink : colors.inkSoft} style={styles.value}>
                {week.count}
              </AppText>
              <Bar
                height={barHeight(week.count, max)}
                color={week.isCurrent ? colors.roseDeep : colors.lavender}
                delay={120 + index * 90}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.axis} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {weeks.map((week) => (
          <AppText
            key={week.start.toISOString()}
            variant="caption"
            align="center"
            numberOfLines={2}
            color={week.isCurrent ? colors.ink : colors.muted}
            style={[styles.label, week.isCurrent ? styles.labelCurrent : null]}>
            {week.isCurrent ? t('insights.thisWeek') : formatWeekRange(week.start, week.end, language)}
          </AppText>
        ))}
      </View>
    </View>
  );
}

function barHeight(count: number, max: number): number {
  if (count <= 0 || max <= 0) return ZERO_HEIGHT;
  return Math.max(MIN_HEIGHT, Math.round((count / max) * PLOT_HEIGHT));
}

function Bar({ height, color, delay }: { height: number; color: string; delay: number }) {
  const animated = useSharedValue(0);
  useEffect(() => {
    animated.set(withDelay(delay, withTiming(height, { duration: 650, easing: Easing.out(Easing.cubic) })));
  }, [animated, height, delay]);
  const style = useAnimatedStyle(() => ({ height: animated.get() }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: PLOT_HEIGHT + 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  value: { marginBottom: spacing.xs, fontFamily: fonts.bodySemiBold },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  axis: { flexDirection: 'row', marginTop: spacing.sm },
  label: { flex: 1, paddingHorizontal: 2 },
  labelCurrent: { fontFamily: fonts.bodySemiBold },
});
