import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatLongDate, parseDateKey } from '../../lib/dates';
import { useSettings } from '../../state';
import { colors, radius, spacing } from '../../theme';
import { AppText, Icon } from '../../ui';

/** "For Monday, May 18": shown when the chooser was opened for a specific day (from the calendar). */
export function DateChip({ date }: { date: string }) {
  const { t } = useTranslation();
  const { language } = useSettings();
  return (
    <View style={styles.chip}>
      <Icon name="CalendarDays" size={15} color={colors.goldDeep} />
      <AppText variant="smallMedium" color={colors.goldDeep}>
        {t('explore.forDate', { date: formatLongDate(parseDateKey(date), language) })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
});
