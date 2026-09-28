import { memo } from 'react';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors } from '../../theme';
import { Butterfly } from '../../ui/art';

const TAU = Math.PI * 2;

interface Flight {
  size: number;
  left?: DimensionValue;
  right?: DimensionValue;
  /** Where in the open sky: 0 = just under the hero text, 1 = just above the horizon. */
  depth: number;
  colorA: string;
  colorB: string;
  opacity: number;
  rotation: number;
  /** Float amplitude in px; nearer (larger) butterflies move more. */
  drift: number;
  /** Floats and wing beats per scene cycle; the phase keeps them out of step. */
  floats: number;
  beats: number;
  phase: number;
}

/** Near, mid and far: sizes and drift shrink with distance, colours cool towards the horizon. */
const FLIGHTS: Flight[] = [
  { size: 46, left: '6%', depth: 0.02, colorA: colors.rose, colorB: colors.peach, opacity: 0.8, rotation: -14, drift: 6, floats: 0.75, beats: 2.8, phase: 0 },
  { size: 30, right: '10%', depth: 0.42, colorA: colors.lavender, colorB: colors.rose, opacity: 0.72, rotation: 18, drift: 4, floats: 0.9, beats: 3.3, phase: 0.37 },
  { size: 22, left: '25%', depth: 0.86, colorA: colors.peach, colorB: colors.lavender, opacity: 0.62, rotation: -6, drift: 2.5, floats: 0.6, beats: 2.4, phase: 0.71 },
];

/** Breathing room under the hero text and above the horizon. */
const TOP_GAP = 14;
const BOTTOM_GAP = 18;
/** With less open sky than this (very short windows) the butterflies would crowd the text or the sun. */
const MIN_BAND = 96;

// Butterfly mints new gradient ids on every render; the wings here are static, so skip re-renders.
const StillButterfly = memo(Butterfly);

function easeInOut(k: number) {
  'worklet';
  return k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) * (2 - 2 * k) * 0.5;
}

function FlyingButterfly({ flight, top, clock }: { flight: Flight; top: number; clock: SharedValue<number> }) {
  // Same drift and wing-beat as the shared Butterfly, but on the scene clock so it pauses with the scene.
  const style = useAnimatedStyle(() => {
    const t = clock.get();
    const float = Math.sin((t * flight.floats + flight.phase) * TAU);
    const sway = Math.sin((t * flight.floats * 0.5 + flight.phase * 1.7) * TAU);
    const beat = (t * flight.beats + flight.phase) % 1;
    const wings =
      beat < 0.16
        ? 1 - 0.28 * easeInOut(beat / 0.16)
        : beat < 0.36
          ? 0.72 + 0.28 * easeInOut((beat - 0.16) / 0.2)
          : 1;
    return {
      transform: [
        { translateX: flight.drift * 0.6 * sway },
        { translateY: -flight.drift * (0.5 + 0.5 * float) },
        { rotate: `${flight.rotation + 4 * float}deg` },
        { scaleX: wings },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.flight,
        { top, left: flight.left, right: flight.right, width: flight.size, height: flight.size },
        style,
      ]}>
      <StillButterfly
        size={flight.size}
        colorA={flight.colorA}
        colorB={flight.colorB}
        opacity={flight.opacity}
        animated={false}
      />
    </Animated.View>
  );
}

export interface SkyButterfliesProps {
  /** Y where the hero text ends. */
  top: number;
  /** Y of the horizon. */
  bottom: number;
  /** The scene clock (cycles); it stops while Home is unfocused or motion is reduced. */
  clock: SharedValue<number>;
}

/** Three butterflies spread through the open sky between the hero text and the horizon. */
export function SkyButterflies({ top, bottom, clock }: SkyButterfliesProps) {
  const from = top + TOP_GAP;
  const band = bottom - BOTTOM_GAP - from;
  if (band < MIN_BAND) return null;

  return (
    <Animated.View entering={FadeIn.delay(500).duration(1400)} style={[StyleSheet.absoluteFill, styles.noTouch]}>
      {FLIGHTS.map((flight) => (
        <FlyingButterfly
          key={flight.size}
          flight={flight}
          top={Math.round(from + flight.depth * (band - flight.size))}
          clock={clock}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  noTouch: {
    pointerEvents: 'none',
  },
  flight: {
    position: 'absolute',
  },
});
