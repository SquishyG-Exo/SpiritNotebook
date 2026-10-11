import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { AppText, Icon } from '../../ui';

/** Small gold "Premium" label. `onDark` for use on the violet header band. */
export function PremiumChip({ onDark = false, style }: { onDark?: boolean; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.chip, onDark ? styles.dark : styles.light, style]}>
      <View>
        <Icon name="Sparkles" size={12} color={onDark ? colors.goldLight : colors.gold} strokeWidth={2} />
      </View>
      <AppText style={[styles.label, { color: onDark ? colors.cream : colors.goldDeep }]}>{t('common.premium')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  light: { backgroundColor: withAlpha(colors.goldLight, 0.32), borderColor: withAlpha(colors.gold, 0.25) },
  dark: { backgroundColor: withAlpha(colors.white, 0.16), borderColor: withAlpha(colors.goldLight, 0.55) },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.4 },
});
