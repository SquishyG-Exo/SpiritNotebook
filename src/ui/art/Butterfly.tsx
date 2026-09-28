import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '../../theme';
import { useSvgId } from './useSvgId';

export interface ButterflyProps {
  /** Wingspan in px. */
  size?: number;
  /** Two wing colours (top → bottom). */
  colorA?: string;
  colorB?: string;
  opacity?: number;
  /** Degrees. */
  rotation?: number;
  /** Gentle drifting + wing-beat animation. */
  animated?: boolean;
  /** Stagger for the animation, ms. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** A stylised, translucent butterfly drawn with soft gradients. */
export function Butterfly({
  size = 64,
  colorA = colors.rose,
  colorB = colors.lavender,
  opacity = 0.85,
  rotation = 0,
  animated = true,
  delay = 0,
  style,
}: ButterflyProps) {
  const drift = useSharedValue(0);
  const flap = useSharedValue(1);
  const id = useSvgId('bf');

  useEffect(() => {
    if (!animated) {
      cancelAnimation(drift);
      cancelAnimation(flap);
      drift.set(0);
      flap.set(1);
      return;
    }
    drift.set(
      withDelay(
        delay,
        withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true),
      ),
    );
    flap.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.72, { duration: 420, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 1600 }),
          ),
          -1,
          false,
        ),
      ),
    );
    return () => {
      cancelAnimation(drift);
      cancelAnimation(flap);
    };
  }, [animated, delay, drift, flap]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 * drift.get() },
      { translateX: 3 * drift.get() },
      { rotate: `${rotation + 4 * drift.get()}deg` },
    ],
  }));
  const flapStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: flap.get() }] }));

  const wing = (mirror: boolean) => (
    <G transform={mirror ? 'scale(-1 1)' : undefined}>
      {/* upper wing */}
      <Path
        d="M2 0 C 10 -22, 34 -34, 44 -24 C 52 -14, 40 2, 20 4 C 12 5, 5 4, 2 0 Z"
        fill={`url(#${id}-upper)`}
      />
      {/* lower wing */}
      <Path
        d="M2 2 C 12 4, 30 10, 30 24 C 30 34, 18 36, 10 28 C 5 22, 2 12, 2 2 Z"
        fill={`url(#${id}-lower)`}
      />
      {/* wing highlight */}
      <Path d="M8 -4 C 16 -16, 30 -24, 38 -20" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </G>
  );

  return (
    <Animated.View pointerEvents="none" style={[{ width: size, height: size, opacity }, driftStyle, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, flapStyle]}>
        <Svg width={size} height={size} viewBox="-50 -42 100 84">
          <Defs>
            <LinearGradient id={`${id}-upper`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="0.45" stopColor={colorA} />
              <Stop offset="1" stopColor={colorB} />
            </LinearGradient>
            <LinearGradient id={`${id}-lower`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colorA} />
              <Stop offset="1" stopColor={colorB} />
            </LinearGradient>
            <RadialGradient id={`${id}-body`} cx="0.5" cy="0.4" r="0.6">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="1" stopColor={colors.navy} stopOpacity="0.7" />
            </RadialGradient>
          </Defs>
          {wing(false)}
          {wing(true)}
          <Ellipse cx="0" cy="2" rx="2.6" ry="16" fill={`url(#${id}-body)`} />
          <Path d="M-1 -14 C -6 -24, -10 -26, -12 -30 M1 -14 C 6 -24, 10 -26, 12 -30" stroke={colors.navy} strokeOpacity="0.55" strokeWidth="1" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

/** Convenience: a butterfly pinned to a corner of its parent (parent needs `position: relative`). */
export function CornerButterfly({
  corner,
  inset = 12,
  insetX = inset,
  insetY = inset,
  ...props
}: ButterflyProps & {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Distance from both edges; insetX / insetY override per axis. */
  inset?: number;
  insetX?: number;
  insetY?: number;
}) {
  const [v, h] = corner.split('-') as ['top' | 'bottom', 'left' | 'right'];
  return (
    <View pointerEvents="none" style={[styles.pinned, { [v]: insetY, [h]: insetX }]}>
      <Butterfly {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  pinned: { position: 'absolute' },
});
