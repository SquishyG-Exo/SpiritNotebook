import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import type { CategoryDef } from '../../../brand/categories';
import { colors, radius, spacing } from '../../theme';
import { AppText, IconCircle, PressableScale } from '../../ui';
import { withAlpha } from '../home/withAlpha';

export interface CategoryTileProps {
  def: CategoryDef;
  label: string;
  index: number;
  /** Smaller label on narrow phones so single long words ("Synchronicities") never break. */
  compact?: boolean;
  onPress: () => void;
}

/** Rounded-square tile in the Explore grid: tinted background, soft icon disc, two-line label. */
export function CategoryTile({ def, label, index, compact = false, onPress }: CategoryTileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(120 + index * 45).duration(480)} style={styles.cell}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.95}
        accessibilityRole="button"
        accessibilityLabel={label}
        testID={`category-${def.key}`}
        style={[styles.tile, compact ? styles.tileCompact : null, { backgroundColor: def.tint }]}>
        <IconCircle name={def.icon} size={44} tint={withAlpha(colors.white, 0.62)} color={def.accent} />
        <AppText
          variant="smallMedium"
          color={colors.ink}
          align="center"
          numberOfLines={2}
          style={[styles.label, compact ? styles.labelCompact : null]}>
          {label}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  tile: {
    aspectRatio: 1 / 1.05,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.7),
  },
  tileCompact: {
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
    minHeight: 34,
  },
  labelCompact: {
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
  },
});
