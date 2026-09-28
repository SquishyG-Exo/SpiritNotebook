import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from './useSvgId';

export type DreamscapeVariant = 'dusk' | 'dawn' | 'night';

export interface DreamscapeProps {
  variant?: DreamscapeVariant;
  style?: StyleProp<ViewStyle>;
}

const PALETTES: Record<
  DreamscapeVariant,
  { sky: [string, string, string]; hillsFar: string; hillsNear: string; mist: string; sun: string; halo: string; stars: number }
> = {
  dusk: {
    sky: ['#8E7BC8', '#D9A6C4', '#F7CDB0'],
    hillsFar: '#8C7BC4',
    hillsNear: '#5B4C9A',
    mist: '#F9DCCB',
    sun: '#FFF3E2',
    halo: '#FFD9BE',
    stars: 10,
  },
  dawn: {
    sky: ['#E6DDFA', '#F6D9E4', '#FCEBDC'],
    hillsFar: '#CDBDF0',
    hillsNear: '#B9A6E6',
    mist: '#FFFFFF',
    sun: '#FFF8EE',
    halo: '#FFE2C8',
    stars: 4,
  },
  night: {
    sky: ['#1B1840', '#3A2F7A', '#8C6BB1'],
    hillsFar: '#2E2A6A',
    hillsNear: '#171436',
    mist: '#8C7BC4',
    sun: '#FFF6E8',
    halo: '#E6C8FF',
    stars: 22,
  },
};

// Deterministic star field so the scene is stable between renders.
const STARS = Array.from({ length: 22 }, (_, i) => {
  const t = i * 137.508; // golden angle spread
  return { x: (t * 3.1) % 400, y: ((t * 1.7) % 95) + 6, r: 0.6 + (i % 3) * 0.45, o: 0.35 + (i % 4) * 0.15 };
});

/**
 * A vector dreamscape: layered sky, glowing horizon light, soft cloud
 * fields, drifting energy rings, misty hills. Fills its parent (400×200
 * viewBox, cover-cropped). No raster assets, crisp at any size.
 */
export function Dreamscape({ variant = 'dusk', style }: DreamscapeProps) {
  const p = PALETTES[variant];
  const id = useSvgId('ds');
  return (
    <Svg
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
      width="100%"
      height="100%"
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.sky[0]} />
          <Stop offset="0.55" stopColor={p.sky[1]} />
          <Stop offset="1" stopColor={p.sky[2]} />
        </LinearGradient>
        <RadialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={p.sun} stopOpacity="0.95" />
          <Stop offset="0.25" stopColor={p.halo} stopOpacity="0.7" />
          <Stop offset="0.6" stopColor={p.halo} stopOpacity="0.22" />
          <Stop offset="1" stopColor={p.halo} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${id}-cloud`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.hillsFar} stopOpacity="0.55" />
          <Stop offset="1" stopColor={p.hillsFar} stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.hillsNear} stopOpacity="0.75" />
          <Stop offset="1" stopColor={p.hillsNear} stopOpacity="0.95" />
        </LinearGradient>
        <LinearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.mist} stopOpacity="0" />
          <Stop offset="0.5" stopColor={p.mist} stopOpacity="0.45" />
          <Stop offset="1" stopColor={p.mist} stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect width="400" height="200" fill={`url(#${id}-sky)`} />

      {/* stars */}
      <G>
        {STARS.slice(0, p.stars).map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
      </G>

      {/* light rays from the horizon */}
      <G transform="translate(200 128)">
        {[-38, -22, -8, 8, 22, 38].map((deg) => (
          <Rect key={deg} x="-3" y="-140" width="6" height="140" fill={`url(#${id}-ray)`} transform={`rotate(${deg})`} opacity="0.6" />
        ))}
      </G>

      {/* energy rings */}
      <G opacity="0.5" stroke="#FFFFFF" fill="none">
        <Circle cx="200" cy="128" r="46" strokeOpacity="0.4" strokeWidth="0.8" />
        <Circle cx="200" cy="128" r="70" strokeOpacity="0.25" strokeWidth="0.7" />
        <Circle cx="200" cy="128" r="98" strokeOpacity="0.14" strokeWidth="0.6" />
      </G>

      {/* sun and halo */}
      <Circle cx="200" cy="128" r="80" fill={`url(#${id}-halo)`} />
      <Circle cx="200" cy="128" r="16" fill={p.sun} opacity="0.95" />

      {/* soft cloud fields */}
      <Ellipse cx="80" cy="60" rx="110" ry="34" fill={`url(#${id}-cloud)`} />
      <Ellipse cx="330" cy="48" rx="120" ry="30" fill={`url(#${id}-cloud)`} />
      <Ellipse cx="250" cy="96" rx="140" ry="26" fill={`url(#${id}-cloud)`} opacity="0.8" />

      {/* misty hills */}
      <Path d="M0 150 C 60 120, 120 132, 170 140 C 230 150, 280 118, 340 128 C 370 133, 390 140, 400 142 L400 200 L0 200 Z" fill={`url(#${id}-far)`} />
      <Path d="M0 172 C 50 156, 110 168, 160 166 C 220 164, 260 148, 320 158 C 360 165, 385 170, 400 172 L400 200 L0 200 Z" fill={`url(#${id}-near)`} />
      <Rect x="0" y="136" width="400" height="34" fill={`url(#${id}-mist)`} />
    </Svg>
  );
}
