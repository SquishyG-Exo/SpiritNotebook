import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '../../theme';
import { Butterfly } from './Butterfly';
import { Dreamscape, type DreamscapeVariant } from './Dreamscape';
import { EnergyField } from './EnergyField';
import { Sparkles, type SparkleSpec } from './Sparkles';

export interface DreamBannerProps {
  /** Painterly artwork (bundled asset). Falls back to the vector dreamscape. */
  source?: ImageSource | number;
  /** Vector scene used when there is no artwork. */
  variant?: DreamscapeVariant;
  height?: number;
  /** Fade the bottom edge into this colour (the page background). Set null to keep a hard edge. */
  fadeTo?: string | null;
  /** Round the corners (for in-page cards) or leave square (full-bleed headers). */
  rounded?: boolean;
  /** Decorative extras. */
  butterflies?: 'none' | 'few' | 'many';
  sparkles?: boolean;
  glow?: boolean;
  /** Content rendered over the artwork (titles, chips). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const SPARKLES: SparkleSpec[] = [
  { x: 0.12, y: 0.22, size: 10, delay: 0 },
  { x: 0.82, y: 0.18, size: 12, delay: 600 },
  { x: 0.68, y: 0.62, size: 8, delay: 1200 },
  { x: 0.3, y: 0.72, size: 7, delay: 300 },
  { x: 0.92, y: 0.5, size: 9, delay: 900 },
];

/**
 * A dreamscape header: artwork (or gradient) with a soft glow, optional
 * butterflies and sparkles, and a fade into the page below.
 */
export function DreamBanner({
  source,
  variant = 'dusk',
  height = 200,
  fadeTo = colors.cream,
  rounded = false,
  butterflies = 'few',
  sparkles = true,
  glow = true,
  children,
  style,
  contentStyle,
}: DreamBannerProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { height }, rounded ? styles.rounded : null, style]}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      ) : (
        <Dreamscape variant={variant} />
      )}
      {glow ? (
        <>
          <EnergyField size={height * 1.6} color={colors.peach} intensity={0.5} style={{ top: -height * 0.5, left: -height * 0.2 }} />
          <EnergyField size={height * 1.2} color={colors.lavender} intensity={0.45} delay={1500} style={{ bottom: -height * 0.4, right: -height * 0.15 }} />
        </>
      ) : null}
      {sparkles ? <Sparkles sparkles={SPARKLES} /> : null}
      {butterflies !== 'none' ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Butterfly size={54} rotation={-18} style={{ position: 'absolute', right: 18, top: 16 }} />
          <Butterfly size={34} rotation={22} delay={900} colorA={colors.peach} colorB={colors.rose} opacity={0.75} style={{ position: 'absolute', left: 22, bottom: 34 }} />
          {butterflies === 'many' ? (
            <>
              <Butterfly size={26} rotation={-30} delay={1500} colorA={colors.lavender} colorB={colors.lavenderDeep} opacity={0.6} style={{ position: 'absolute', left: '48%', top: 12 }} />
              <Butterfly size={20} rotation={35} delay={2100} opacity={0.55} style={{ position: 'absolute', right: '30%', bottom: 18 }} />
            </>
          ) : null}
        </View>
      ) : null}
      {fadeTo ? (
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', fadeTo]}
          style={[styles.fade, { height: Math.min(96, height * 0.55) }]}
        />
      ) : null}
      {children ? <View pointerEvents="box-none" style={[styles.content, contentStyle]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.lavenderSoft },
  rounded: { borderRadius: radius.xl },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  content: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
});
