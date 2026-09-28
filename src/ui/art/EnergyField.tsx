import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useSvgId } from './useSvgId';

export interface EnergyFieldProps {
  /** Diameter in px. */
  size?: number;
  color?: string;
  /** Peak opacity at the centre. */
  intensity?: number;
  /** Slow breathing scale animation. */
  animated?: boolean;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** A soft radial glow: layered translucent rings that breathe slowly. Place behind content. */
export function EnergyField({ size = 260, color = '#E9A6BB', intensity = 0.55, animated = true, delay = 0, style }: EnergyFieldProps) {
  const pulse = useSharedValue(0);
  const id = useSvgId('ef');

  useEffect(() => {
    if (!animated) {
      cancelAnimation(pulse);
      pulse.set(0);
      return;
    }
    const start = () =>
      pulse.set(withRepeat(withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.sin) }), -1, true));
    const timer = setTimeout(start, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(pulse);
    };
  }, [animated, delay, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.08 * pulse.get() }],
    opacity: 0.85 + 0.15 * pulse.get(),
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ width: size, height: size }, styles.abs, animatedStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={intensity} />
            <Stop offset="0.35" stopColor={color} stopOpacity={intensity * 0.7} />
            <Stop offset="0.7" stopColor={color} stopOpacity={intensity * 0.22} />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
        <Circle cx="50" cy="50" r="30" fill="none" stroke="#FFFFFF" strokeOpacity={intensity * 0.35} strokeWidth="0.6" />
        <Circle cx="50" cy="50" r="41" fill="none" stroke="#FFFFFF" strokeOpacity={intensity * 0.18} strokeWidth="0.5" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
