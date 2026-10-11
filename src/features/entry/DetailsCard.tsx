import { useState, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { formatDate, formatTime } from '../../lib/dates';
import type { Language } from '../../state';
import { colors, fonts, spacing, withAlpha } from '../../theme';
import { AppText, Icon, IconCircle } from '../../ui';
import { glass, glassBlur } from './scenery';
import { TimePicker } from './TimePicker';
import { Toggle } from './Toggle';
import { combineDayAndTime, relativeDay, type TimeOfDay } from './when';

/** Long enough for "Blue boat on a silver sea"; the API accepts more, search reads it first. */
export const TITLE_MAX = 80;

export interface DetailsCardProps {
  title: string;
  onChangeTitle: (title: string) => void;
  titlePlaceholder: string;
  /** Moves focus on to the main text when the title is submitted. */
  onSubmitTitle?: () => void;
  titleRef?: Ref<TextInput>;
  day: Date;
  now: Date;
  onOpenDate: () => void;
  time: TimeOfDay | null;
  onToggleTime: () => void;
  onChangeTime: (time: TimeOfDay) => void;
  language: Language;
}

/** One frosted card for the entry's details: an optional title, the day it happened and an optional time. */
export function DetailsCard({
  title,
  onChangeTitle,
  titlePlaceholder,
  onSubmitTitle,
  titleRef,
  day,
  now,
  onOpenDate,
  time,
  onToggleTime,
  onChangeTime,
  language,
}: DetailsCardProps) {
  const { t } = useTranslation();
  const relative = relativeDay(day, now);
  const dateText = formatDate(day, language);
  const dateValue = relative ? t('entry.when.relative', { label: t(`entry.when.${relative}`), date: dateText }) : dateText;
  const timeText = time ? formatTime(combineDayAndTime(day, time), language) : null;
  // The picker opens when the reader switches a time on; today's automatic time stays folded until tapped.
  const [pickerOpen, setPickerOpen] = useState(false);
  const toggleTime = () => {
    setPickerOpen(!time);
    onToggleTime();
  };

  return (
    <View style={[glass.card, glassBlur, styles.card]}>
      {/* Title */}
      <View style={styles.row}>
        <RowIcon name="PenLine" />
        <View style={styles.body}>
          <View style={styles.labelRow}>
            <AppText variant="overline" color={colors.goldDeep}>
              {t('entry.titleField.label')}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {t('entry.titleField.optional')}
            </AppText>
          </View>
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={onChangeTitle}
            maxLength={TITLE_MAX}
            placeholder={titlePlaceholder}
            placeholderTextColor={colors.faint}
            selectionColor={colors.plum}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={onSubmitTitle}
            autoCapitalize="sentences"
            accessibilityLabel={t('entry.titleField.a11y')}
            testID="entry-title"
            style={styles.titleInput}
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Date */}
      <Pressable
        onPress={onOpenDate}
        accessibilityRole="button"
        accessibilityLabel={t('entry.when.changeDate', { date: dateValue })}
        testID="entry-date"
        style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}>
        <RowIcon name="CalendarDays" />
        <View style={styles.body}>
          <AppText variant="overline" color={colors.goldDeep}>
            {t('entry.when.dateLabel')}
          </AppText>
          <AppText variant="bodyMedium" numberOfLines={1} testID="entry-date-value">
            {dateValue}
          </AppText>
        </View>
        <Icon name="ChevronRight" size={20} color={colors.gold} strokeWidth={2} />
      </Pressable>

      <View style={styles.divider} />

      {/* Optional time */}
      <View style={styles.row}>
        <RowIcon name="Clock" />
        {time ? (
          <Pressable
            onPress={() => setPickerOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={t('entry.when.adjustTime', { time: timeText })}
            accessibilityState={{ expanded: pickerOpen }}
            aria-expanded={pickerOpen}
            testID="entry-time-edit"
            style={({ pressed }) => [styles.body, pressed ? styles.pressed : null]}>
            <AppText variant="overline" color={colors.goldDeep}>
              {t('entry.when.timeLabel')}
            </AppText>
            <View style={styles.valueRow}>
              <AppText variant="bodyMedium" numberOfLines={1} testID="entry-time-value">
                {timeText}
              </AppText>
              <Icon name={pickerOpen ? 'ChevronUp' : 'ChevronDown'} size={18} color={colors.gold} strokeWidth={2} />
            </View>
          </Pressable>
        ) : (
          // The switch beside it carries the same label for assistive tech.
          <Pressable
            onPress={toggleTime}
            accessible={false}
            aria-hidden
            style={({ pressed }) => [styles.body, pressed ? styles.pressed : null]}>
            <AppText variant="bodyMedium" color={colors.inkSoft}>
              {t('entry.when.addTime')}
            </AppText>
          </Pressable>
        )}
        <Pressable
          onPress={toggleTime}
          accessibilityRole="switch"
          accessibilityLabel={t('entry.when.addTime')}
          accessibilityState={{ checked: !!time }}
          aria-checked={!!time}
          hitSlop={8}
          testID="entry-time-toggle">
          <Toggle value={!!time} />
        </Pressable>
      </View>

      {time && pickerOpen ? (
        <Animated.View entering={FadeIn.duration(260)} style={styles.picker}>
          <TimePicker value={time} onChange={onChangeTime} language={language} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function RowIcon({ name }: { name: string }) {
  return <IconCircle name={name} size={36} tint={withAlpha(colors.white, 0.85)} color={colors.gold} strokeWidth={1.7} />;
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  titleInput: {
    fontVariant: ['lining-nums'],
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 26,
    color: colors.ink,
    padding: 0,
    margin: 0,
    minHeight: 28,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: withAlpha(colors.plum, 0.16),
    marginLeft: 36 + spacing.md,
  },
  picker: {
    paddingBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
