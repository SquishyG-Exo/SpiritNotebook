import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import type { CategoryDef } from '../../../brand/categories';
import { colors, gradients, radius, spacing } from '../../theme';
import { AppText, Icon, IconCircle } from '../../ui';
import { withAlpha } from '../home/withAlpha';

/** Abstract header art for a reading: a dusk gradient with the category's icon glowing softly in the middle. */
export function ReadingBanner({ def, hasPhoto }: { def: CategoryDef; hasPhoto?: boolean }) {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={gradients.dusk} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      <View style={[styles.orb, styles.orbLeft]} />
      <View style={[styles.orb, styles.orbRight]} />
      <View style={[styles.spark, { top: 24, left: '22%' }]} />
      <View style={[styles.spark, { top: 38, right: '20%' }]} />
      <View style={[styles.spark, styles.sparkSmall, { bottom: 30, left: '30%' }]} />
      <View style={[styles.spark, styles.sparkSmall, { bottom: 22, right: '28%' }]} />

      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <IconCircle
            name={def.icon}
            size={72}
            tint={withAlpha(colors.white, 0.62)}
            color={def.accent}
            strokeWidth={1.5}
          />
        </View>
      </View>

      {hasPhoto ? (
        <View style={styles.badge}>
          <Icon name="Image" size={13} color={colors.inkSoft} />
          <AppText variant="caption" color={colors.inkSoft}>
            {t('reading.photoAttached')}
          </AppText>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 144,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: withAlpha(colors.white, 0.22),
  },
  orbLeft: {
    width: 160,
    height: 160,
    left: -50,
    bottom: -70,
  },
  orbRight: {
    width: 120,
    height: 120,
    right: -30,
    top: -46,
  },
  spark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: withAlpha(colors.white, 0.85),
  },
  sparkSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: withAlpha(colors.white, 0.7),
  },
  ringOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.45),
  },
  ringInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.2),
  },
  badge: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.white, 0.6),
  },
});
