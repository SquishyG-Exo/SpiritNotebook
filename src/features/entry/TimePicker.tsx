import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type AccessibilityActionEvent } from 'react-native';

import type { Language } from '../../state';
import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { dayPeriodLabels, setPm, stepHour, stepMinute, toTwelveHour, type TimeOfDay } from './when';

export interface TimePickerProps {
  value: TimeOfDay;
  onChange: (next: TimeOfDay) => void;
  language: Language;
}

/** Hour and minute steppers with an AM / PM switch: compact, thumb-friendly, the same on web and native. */
export function TimePicker({ value, onChange, language }: TimePickerProps) {
  const { t } = useTranslation();
  const { hour12, pm } = toTwelveHour(value);
  const periods = dayPeriodLabels(language);

  return (
    <View style={styles.root} testID="entry-time-picker">
      <Stepper
        display={String(hour12)}
        label={t('entry.when.hour')}
        upLabel={t('entry.when.laterHour')}
        downLabel={t('entry.when.earlierHour')}
        onStep={(delta) => onChange(stepHour(value, delta))}
        testID="entry-hour"
      />
      <AppText style={styles.colon} color={colors.plum} accessibilityElementsHidden importantForAccessibility="no">
        :
      </AppText>
      <Stepper
        display={String(value.minute).padStart(2, '0')}
        label={t('entry.when.minute')}
        upLabel={t('entry.when.laterMinute')}
        downLabel={t('entry.when.earlierMinute')}
        onStep={(delta) => onChange(stepMinute(value, delta))}
        testID="entry-minute"
      />
      <View style={styles.periods} accessibilityRole="radiogroup" accessibilityLabel={t('entry.when.period')}>
        <Period label={periods.am} selected={!pm} onPress={() => onChange(setPm(value, false))} testID="entry-am" />
        <Period label={periods.pm} selected={pm} onPress={() => onChange(setPm(value, true))} testID="entry-pm" />
      </View>
    </View>
  );
}

interface StepperProps {
  display: string;
  label: string;
  upLabel: string;
  downLabel: string;
  onStep: (delta: 1 | -1) => void;
  testID: string;
}

function Stepper({ display, label, upLabel, downLabel, onStep, testID }: StepperProps) {
  const onAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') onStep(1);
    if (event.nativeEvent.actionName === 'decrement') onStep(-1);
  };

  return (
    <View style={styles.stepper}>
      <Chevron icon="ChevronUp" label={upLabel} onPress={() => onStep(1)} testID={`${testID}-up`} />
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: display }}
        aria-valuetext={display}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAction}
        style={styles.valueBox}>
        <AppText style={styles.value} color={colors.ink} testID={`${testID}-value`}>
          {display}
        </AppText>
      </View>
      <Chevron icon="ChevronDown" label={downLabel} onPress={() => onStep(-1)} testID={`${testID}-down`} />
    </View>
  );
}

function Chevron({ icon, label, onPress, testID }: { icon: string; label: string; onPress: () => void; testID: string }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.86}
      hitSlop={{ top: 4, bottom: 4, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={styles.chevron}>
      <Icon name={icon} size={20} color={colors.gold} strokeWidth={2.2} />
    </PressableScale>
  );
}

function Period({ label, selected, onPress, testID }: { label: string; selected: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      aria-checked={selected}
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [styles.period, selected ? styles.periodOn : null, pressed && !selected ? styles.pressed : null]}>
      <AppText variant="smallMedium" color={selected ? colors.white : colors.plum}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepper: {
    alignItems: 'center',
    width: 64,
  },
  chevron: {
    width: 44,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBox: {
    minWidth: 60,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.7),
    borderWidth: 1,
    borderColor: withAlpha(colors.gold, 0.25),
  },
  value: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 30,
    lineHeight: 34,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  colon: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 28,
    lineHeight: 34,
    marginTop: -2,
  },
  periods: {
    marginLeft: spacing.md,
    gap: spacing.xs + 2,
  },
  period: {
    minWidth: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withAlpha(colors.plum, 0.25),
    backgroundColor: withAlpha(colors.white, 0.7),
  },
  periodOn: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  pressed: {
    opacity: 0.7,
  },
});
