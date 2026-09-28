import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, gradients } from '../../theme';
import { Icon } from '../../ui';
import { withAlpha } from '../home/withAlpha';

const webSoft: ViewStyle | null = Platform.OS === 'web' ? { filter: 'blur(6px)' } : null;

export interface BreathingOrbProps {
  size?: number;
  icon: string;
}

/** Soft gradient orb with two halo rings that breathe while the reading is prepared. */
export function BreathingOrb({ size = 120, icon }: BreathingOrbProps) {
  const breath = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    breath.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.97 + 0.06 * breath.get() }],
  }));
  const innerRing = useAnimatedStyle(() => ({
    transform: [{ scale: 1.16 + 0.1 * breath.get() }],
    opacity: 0.7 - 0.3 * breath.get(),
  }));
  const outerRing = useAnimatedStyle(() => ({
    transform: [{ scale: 1.36 + 0.2 * breath.get() }],
    opacity: 0.45 - 0.3 * breath.get(),
  }));

  const box = size * 1.7;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.box, { width: box, height: box }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.ring, circle, outerRing]} />
      <Animated.View style={[styles.ring, styles.ringInner, circle, innerRing]} />
      <Animated.View style={[styles.orbShadow, circle, orbStyle]}>
        <LinearGradient
          colors={gradients.sky}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.orb, circle]}>
          <View
            style={[
              styles.highlight,
              webSoft,
              { width: size * 0.46, height: size * 0.3, borderRadius: size * 0.2, top: size * 0.12, left: size * 0.16 },
            ]}
          />
          <Icon name={icon} size={Math.round(size * 0.28)} color={colors.white} strokeWidth={1.6} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: withAlpha(colors.lavender, 0.9),
    backgroundColor: withAlpha(colors.lavenderSoft, 0.35),
  },
  ringInner: {
    borderColor: colors.rose,
    backgroundColor: withAlpha(colors.roseSoft, 0.4),
  },
  orbShadow: {
    boxShadow: `0 16px 40px ${withAlpha(colors.lavenderDeep, 0.32)}`,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: withAlpha(colors.white, 0.2),
    transform: [{ rotate: '-24deg' }],
  },
});
