import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '../../theme';
import { useSvgId } from '../../ui/art/useSvgId';

export interface LotusGlowProps {
  size: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A warm, ringless halo that breathes slowly behind the lotus: the screen's
 * one gentle loop (still when the reader prefers reduced motion).
 */
export function LotusGlow({ size, style }: LotusGlowProps) {
  const id = useSvgId('lotusglow');
  const breath = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    breath.set(withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.94 + 0.1 * breath.get() }],
    opacity: 0.75 + 0.25 * breath.get(),
  }));

  const half = size / 2;
  return (
    <Animated.View style={[styles.glow, { width: size, height: size }, animatedStyle, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.cream} stopOpacity={0.95} />
            <Stop offset="0.35" stopColor={colors.peachSoft} stopOpacity={0.7} />
            <Stop offset="0.68" stopColor={colors.peach} stopOpacity={0.24} />
            <Stop offset="1" stopColor={colors.peach} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={half} cy={half} r={half} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
