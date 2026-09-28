import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, gradients } from '../../theme';
import { EnergyField } from '../../ui/art';
import { SkyButterflies } from './SkyButterflies';
import { withAlpha } from './withAlpha';

/** Horizon line, as a fraction of the scene height. */
const HORIZON = 0.53;

/**
 * One slow clock drives every loop in the scene (halo breathing + star
 * twinkle): it counts "cycles" upward linearly and each element derives a
 * periodic value from it, so pausing and resuming never jumps.
 */
const CYCLE_MS = 8000;
const RUN_CYCLES = 900;
const TAU = Math.PI * 2;

const SUN = 62;
/** How far the sun's center sits above the horizon. */
const SUN_LIFT = 16;
/**
 * Faint energy field around the sun. Static, so the halo stays the only
 * breathing layer there, and never taller than the open sky: its outer ring
 * (41% of its size) stays below the hero text on short screens.
 */
const FIELD_MAX = 420;
const FIELD_RING = 0.41;

function fieldSize(sceneHeight: number, clearTop: number): number {
  const sunY = sceneHeight * HORIZON - SUN_LIFT;
  return Math.max(0, Math.min(FIELD_MAX, Math.floor((sunY - clearTop - 12) / FIELD_RING)));
}

const HALOS = [
  { size: 340, alpha: 0.2, color: colors.peach },
  { size: 236, alpha: 0.3, color: colors.peach },
  { size: 150, alpha: 0.46, color: colors.cream },
] as const;

/** Soft-focus for glows on the web; native keeps the layered box-shadow version. */
const webBlur = (px: number): ViewStyle | null =>
  Platform.OS === 'web' ? { filter: `blur(${px}px)` } : null;

interface StarDef {
  left: DimensionValue;
  top: DimensionValue;
  size: number;
  phase: number;
  speed: number;
}

// Kept to the top corners and the open sky between the text and the horizon.
const STARS: StarDef[] = [
  { left: '7%', top: '3.5%', size: 2.5, phase: 0.1, speed: 1 },
  { left: '93%', top: '2.5%', size: 2, phase: 0.55, speed: 2 },
  { left: '80%', top: '33%', size: 3, phase: 0.8, speed: 1 },
  { left: '15%', top: '36%', size: 2, phase: 0.35, speed: 2 },
  { left: '92%', top: '40%', size: 2, phase: 0.2, speed: 1 },
  { left: '6%', top: '41%', size: 2.5, phase: 0.65, speed: 1 },
];

/** Thin glints on the water, px below the horizon. */
const RIPPLES = [
  { top: 8, width: 150, offset: -6, alpha: 0.5 },
  { top: 20, width: 86, offset: 18, alpha: 0.4 },
  { top: 36, width: 176, offset: -16, alpha: 0.26 },
  { top: 58, width: 110, offset: 12, alpha: 0.2 },
] as const;

function useSceneClock(): SharedValue<number> {
  const clock = useSharedValue(0);
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!focused || reduceMotion) return;
    const from = clock.get();
    clock.set(
      withTiming(from + RUN_CYCLES, { duration: RUN_CYCLES * CYCLE_MS, easing: Easing.linear }),
    );
    return () => cancelAnimation(clock);
  }, [clock, focused, reduceMotion]);

  return clock;
}

function Star({ star, clock }: { star: StarDef; clock: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const wave = 0.5 + 0.5 * Math.sin((clock.get() * star.speed + star.phase) * TAU);
    return { opacity: 0.2 + 0.7 * wave };
  });
  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        style,
      ]}
    />
  );
}

export interface DuskSceneProps {
  /** Y (px from the top of the scene) where the hero text ends; butterflies stay below it. */
  clearTop?: number;
}

/**
 * Abstract dusk scenery for Home: violet → rose → peach sky, a glowing sun
 * resting on the horizon with a slowly breathing halo inside a faint energy
 * field, soft hills, a few butterflies drifting in the open sky, and deep
 * water with a column of reflected light and a few ripples.
 */
export function DuskScene({ clearTop }: DuskSceneProps) {
  const clock = useSceneClock();
  const [height, setHeight] = useState(0);
  const measured = clearTop !== undefined && height > 0;
  const field = measured ? fieldSize(height, clearTop) : 0;

  const haloStyle = useAnimatedStyle(() => {
    const wave = 0.5 - 0.5 * Math.cos(clock.get() * TAU);
    return { transform: [{ scale: 1 + 0.06 * wave }], opacity: 0.88 + 0.12 * wave };
  });

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.noTouch]}
      onLayout={(event) => {
        // Ignore the empty layout of a covered screen so the sky art stays put (and paused) underneath.
        const next = event.nativeEvent.layout.height;
        if (next > 0) setHeight(next);
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {/* Sky */}
      <View style={[styles.sky, { height: `${HORIZON * 100}%` }]}>
        <LinearGradient
          colors={gradients.sky}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Deepen the upper sky so the title reads clearly. */}
        <LinearGradient
          colors={[withAlpha(gradients.night[0], 0.5), withAlpha(gradients.night[0], 0)]}
          style={styles.skyShade}
        />

        {/* Distant hills: a hazy one behind the sun, two nearer ones framing it. */}
        <View style={[styles.hill, styles.hillBack]} />

        <View style={styles.horizonAnchor}>
          {field > 0 ? (
            <Animated.View entering={FadeIn.duration(900)} style={styles.fieldAnchor}>
              <EnergyField
                size={field}
                color={colors.rose}
                intensity={0.3}
                animated={false}
                style={{ left: -field / 2, top: -field / 2 - SUN_LIFT }}
              />
            </Animated.View>
          ) : null}
          {/* The blur sits on a static child so the breathing transform only re-composites it. */}
          <Animated.View style={[styles.haloBox, haloStyle]}>
            <View style={[styles.haloBlur, webBlur(14)]}>
              {HALOS.map((halo) => (
                <View
                  key={halo.size}
                  style={[
                    styles.halo,
                    {
                      width: halo.size,
                      height: halo.size,
                      borderRadius: halo.size / 2,
                      backgroundColor: withAlpha(halo.color, halo.alpha),
                      boxShadow: `0 0 ${Math.round(halo.size / 5)}px ${withAlpha(colors.peach, halo.alpha * 1.6)}`,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
          <View style={styles.sun} />
        </View>

        <View style={[styles.hill, styles.hillLeft]} />
        <View style={[styles.hill, styles.hillRight]} />
      </View>

      {/* Water */}
      <View style={[styles.water, { top: `${HORIZON * 100}%` }]}>
        <LinearGradient
          colors={[gradients.night[2], gradients.night[1], gradients.night[0]]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[withAlpha(colors.rose, 0.5), withAlpha(colors.rose, 0)]}
          style={styles.waterSheen}
        />
        <View style={[styles.reflectedGlow, webBlur(16)]} />
        <LinearGradient
          colors={[withAlpha(colors.peach, 0.34), withAlpha(colors.peach, 0)]}
          style={[styles.columnWide, webBlur(14)]}
        />
        <LinearGradient
          colors={[withAlpha(colors.cream, 0.78), withAlpha(colors.peach, 0.3), withAlpha(colors.peach, 0)]}
          locations={[0, 0.45, 1]}
          style={[styles.column, webBlur(5)]}
        />
        {RIPPLES.map((ripple) => (
          <LinearGradient
            key={ripple.top}
            colors={[
              withAlpha(colors.cream, 0),
              withAlpha(colors.cream, ripple.alpha),
              withAlpha(colors.cream, 0),
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.ripple,
              { top: ripple.top, width: ripple.width, marginLeft: -ripple.width / 2 + ripple.offset },
            ]}
          />
        ))}
        <LinearGradient
          colors={[withAlpha(colors.cream, 0), withAlpha(colors.cream, 0.55), withAlpha(colors.cream, 0)]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.horizonLine}
        />
      </View>

      {STARS.map((star) => (
        <Star key={`${star.left}-${star.top}`} star={star} clock={clock} />
      ))}

      {measured ? <SkyButterflies top={clearTop} bottom={height * HORIZON} clock={clock} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  noTouch: {
    pointerEvents: 'none',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  skyShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  horizonAnchor: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 0,
    height: 0,
  },
  fieldAnchor: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  haloBox: {
    position: 'absolute',
    width: HALOS[0].size,
    height: HALOS[0].size,
    left: -HALOS[0].size / 2,
    top: -HALOS[0].size / 2 - SUN_LIFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloBlur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  sun: {
    position: 'absolute',
    width: SUN,
    height: SUN,
    borderRadius: SUN / 2,
    left: -SUN / 2,
    top: -SUN / 2 - SUN_LIFT,
    backgroundColor: colors.cream,
    boxShadow: `0 0 26px 8px ${withAlpha(colors.peach, 0.95)}, 0 0 60px 18px ${withAlpha(colors.rose, 0.45)}`,
  },
  hill: {
    position: 'absolute',
  },
  // Large ellipses sunk below the horizon: only a gentle dome shows above it.
  hillBack: {
    left: '65%',
    width: 360,
    height: 360,
    marginLeft: -180,
    borderRadius: 180,
    bottom: 26 - 360,
    backgroundColor: withAlpha(colors.lavenderDeep, 0.26),
    transform: [{ scaleX: 1.4 }],
  },
  hillLeft: {
    left: '10%',
    width: 300,
    height: 300,
    marginLeft: -150,
    borderRadius: 150,
    bottom: 38 - 300,
    backgroundColor: withAlpha(gradients.night[2], 0.58),
    transform: [{ scaleX: 1.5 }],
  },
  hillRight: {
    left: '88%',
    width: 260,
    height: 260,
    marginLeft: -130,
    borderRadius: 130,
    bottom: 30 - 260,
    backgroundColor: withAlpha(gradients.night[2], 0.48),
    transform: [{ scaleX: 1.5 }],
  },
  water: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  waterSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  reflectedGlow: {
    position: 'absolute',
    top: -60,
    left: '50%',
    width: 220,
    height: 120,
    marginLeft: -110,
    borderRadius: 110,
    backgroundColor: withAlpha(colors.peach, 0.22),
    boxShadow: `0 0 48px 16px ${withAlpha(colors.peach, 0.2)}`,
    transform: [{ scaleY: 0.55 }],
  },
  columnWide: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 112,
    marginLeft: -56,
    height: '64%',
  },
  column: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 34,
    marginLeft: -17,
    height: '52%',
  },
  ripple: {
    position: 'absolute',
    left: '50%',
    height: 1.5,
    borderRadius: 1,
  },
  horizonLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.cream,
    boxShadow: `0 0 6px 1px ${withAlpha(colors.cream, 0.8)}`,
  },
});
