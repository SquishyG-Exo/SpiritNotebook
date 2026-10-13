import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '../../theme';
import { DecorativeImage } from './DecorativeImage';
import { art } from './images';
import { useSvgId } from './useSvgId';

export interface LotusMarkProps {
  /** Height of the lotus in px; the width follows art.lotusAspect. */
  height: number;
  /** Soft warm glow behind the flower. */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Glow diameter relative to the lotus height. */
const GLOW_SCALE = 1.9;

/**
 * The watercolor lotus (the brand mark) with a soft warm glow behind it, as
 * on Design 4's Home. The glow spills past the box without taking layout
 * space. Decorative: hidden from assistive tech, never intercepts touches.
 */
export function LotusMark({ height, glow = true, style }: LotusMarkProps) {
  const id = useSvgId('lotus');
  const width = Math.round(height * art.lotusAspect);
  const glowSize = Math.round(height * GLOW_SCALE);
  const half = glowSize / 2;

  return (
    <View
      style={[styles.wrap, { width, height }, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {glow ? (
        <Svg
          width={glowSize}
          height={glowSize}
          // Centred a little above the middle: the flower's heart sits high in the painting.
          style={[styles.glow, { left: (width - glowSize) / 2, top: (height - glowSize) / 2 - height * 0.02 }]}>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.cream} stopOpacity={0.95} />
              <Stop offset="0.32" stopColor={colors.peachSoft} stopOpacity={0.72} />
              <Stop offset="0.64" stopColor={colors.peach} stopOpacity={0.26} />
              <Stop offset="1" stopColor={colors.peach} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={half} cy={half} r={half} fill={`url(#${id})`} />
        </Svg>
      ) : null}
      <DecorativeImage source={art.lotus} contentFit="contain" priority="high" loading="eager" style={{ width, height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
});
