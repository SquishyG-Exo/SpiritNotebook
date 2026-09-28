import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

export interface SparkleSpec {
  /** Position as a fraction of the parent (0–1). */
  x: number;
  y: number;
  size?: number;
  delay?: number;
}

export interface SparklesProps {
  sparkles: SparkleSpec[];
  color?: string;
  /** Twinkle animation. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

function Sparkle({ x, y, size = 10, delay = 0, color, animated }: SparkleSpec & { color: string; animated: boolean }) {
  const glow = useSharedValue(0.35);
  useEffect(() => {
    if (!animated) return;
    glow.set(
      withDelay(delay, withRepeat(withTiming(1, { duration: 1800 + (delay % 700), easing: Easing.inOut(Easing.sin) }), -1, true)),
    );
  }, [animated, delay, glow]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glow.get(),
    transform: [{ scale: 0.8 + 0.3 * glow.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.sparkle, { left: `${x * 100}%`, top: `${y * 100}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 0 C 10.6 6, 14 9.4, 20 10 C 14 10.6, 10.6 14, 10 20 C 9.4 14, 6 10.6, 0 10 C 6 9.4, 9.4 6, 10 0 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

/** A scattering of four-point stars that twinkle softly. Fills its parent. */
export function Sparkles({ sparkles, color = '#FFFFFF', animated = true, style }: SparklesProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {sparkles.map((spec, index) => (
        <Sparkle key={index} {...spec} color={color} animated={animated} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: { position: 'absolute' },
});
