import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CategoryDef } from '../../../brand/categories';
import { colors, radius, spacing , withAlpha } from '../../theme';
import { AppText, Icon, IconCircle, type IconName } from '../../ui';
import { DreamBanner } from '../../ui/art';

/** An icon on a translucent white disc inside a soft ring, so it reads over the artwork. */
function Emblem({ icon, color, size }: { icon: IconName | string; color: string; size: number }) {
  const ring = Math.round(size * 1.56);
  const disc = Math.round(size * 1.25);
  return (
    <View style={[styles.ring, { width: ring, height: ring, borderRadius: ring / 2 }]}>
      <View style={[styles.disc, { width: disc, height: disc, borderRadius: disc / 2 }]}>
        <IconCircle name={icon} size={size} tint={withAlpha(colors.white, 0.84)} color={color} strokeWidth={1.5} />
      </View>
    </View>
  );
}

/** Header art for a reading: a dusk dreamscape with the category's icon glowing in the middle. */
export function ReadingBanner({ def, hasPhoto }: { def: CategoryDef; hasPhoto?: boolean }) {
  const { t } = useTranslation();
  return (
    <DreamBanner
      variant="dusk"
      height={170}
      rounded
      fadeTo={null}
      butterflies="few"
      sparkles
      glow
      contentStyle={styles.centered}>
      <Emblem icon={def.icon} color={def.accent} size={72} />
      {hasPhoto ? (
        <View style={styles.badge}>
          <Icon name="Image" size={13} color={colors.inkSoft} />
          <AppText variant="caption" color={colors.inkSoft}>
            {t('reading.photoAttached')}
          </AppText>
        </View>
      ) : null}
    </DreamBanner>
  );
}

/**
 * The care result's calmer header: a dawn scene with no butterflies or
 * sparkles, fading into the panel it opens, with the heart in the middle.
 */
export function CareBanner({ fadeTo, style }: { fadeTo: string; style?: StyleProp<ViewStyle> }) {
  return (
    <DreamBanner
      variant="dawn"
      height={128}
      fadeTo={fadeTo}
      butterflies="none"
      sparkles={false}
      style={style}
      contentStyle={styles.centered}>
      <Emblem icon="Heart" color={colors.roseDeep} size={56} />
    </DreamBanner>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.6),
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.3),
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
    backgroundColor: withAlpha(colors.white, 0.82),
  },
});
