import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors, fonts, shadow } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';

/** Space between tiles, both ways. */
export const TILE_GAP = 9;
/**
 * Fits an icon, a two-line title and a two-line subtitle (8 + 34 + 3 + 2×18 + 3 + 2×14 + 8, plus the
 * 1 px border), so every row is the same height.
 */
export const TILE_MIN_HEIGHT = 122;
const TILE_RADIUS = 18;
const ICON_SIZE = 34;
/**
 * The custom icons (src/ui/customIcons.tsx) already zoom to lucide's optical size;
 * the butterfly's wide, short shape still reads a touch small at tile size.
 */
const ICON_SCALE: Record<string, number> = { Butterfly: 1.08 };

export interface HomeTileProps {
  /** Gold line icon (a name registered in src/ui/icons.tsx). */
  icon: string;
  label: string;
  subtitle: string;
  /** Gold serif numerals shown instead of the icon (Design 4 draws Numbers as "11:11"). */
  numerals?: string;
  /** Position in the grid, for the staggered entrance. */
  order: number;
  onPress: () => void;
  testID?: string;
}

/**
 * Design 4 tile: translucent glass over the sky art, a gold line icon, a serif
 * title and a small subtitle (each up to two lines). Tiles in a row share the
 * row's height, so mixed one- and two-line titles stay aligned.
 */
export function HomeTile({ icon, label, subtitle, numerals, order, onPress, testID }: HomeTileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(160 + order * 40).duration(460)} style={styles.cell}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.95}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${subtitle}`}
        testID={testID}
        style={styles.tile}>
        <View style={styles.art}>
          {numerals ? (
            <AppText style={styles.numerals} accessible={false}>
              {numerals}
            </AppText>
          ) : (
            <Icon
              name={icon}
              size={Math.round(ICON_SIZE * (ICON_SCALE[icon] ?? 1))}
              color={colors.gold}
              strokeWidth={1.5 / (ICON_SCALE[icon] ?? 1)}
            />
          )}
        </View>
        <AppText style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
        <AppText style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

/**
 * Three-column grid for HomeTile. Cells are a third of the width each with
 * the gap split around them, so a short last row centres (Explore's eight
 * categories) without measuring anything.
 */
export function TileGrid({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.grid, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -TILE_GAP / 2,
    marginBottom: -TILE_GAP,
  },
  cell: {
    width: '33.333%',
    paddingHorizontal: TILE_GAP / 2,
    paddingBottom: TILE_GAP,
  },
  tile: {
    flex: 1,
    minHeight: TILE_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: TILE_RADIUS,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    ...shadow.tile,
  },
  art: {
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  numerals: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: ICON_SIZE,
    letterSpacing: 0.4,
    color: colors.gold,
    fontVariant: ['lining-nums'],
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: colors.plum,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
