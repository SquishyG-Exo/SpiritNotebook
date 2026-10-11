/**
 * Design 4 scenery for the entry flow (composer, reading, whispers): the
 * watercolor sky behind the page, with an optional violet header band, and
 * the top bar that sits on it. Glass surfaces, the round glass buttons and
 * the band colours are shared from src/ui.
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, withAlpha } from '../../theme';
import { AppText, glass, GlassIconButton, HEADER_TEXT, SKY_BAND } from '../../ui';
import { SkyBackdrop } from '../../ui/art';

/** How far down the violet band reaches, below the safe-area inset. */
const BAND_HEIGHT = 330;

export interface SkyBackgroundProps {
  /** A cream wash over the art (0–1) for calmer, text-heavy pages. */
  veil?: number;
  /** The violet header band (cream header text goes on it). */
  band?: boolean;
}

/**
 * The dusk sky, fixed behind the page content, with an optional cream veil and
 * violet band. Decorative: hidden from assistive tech, never intercepts touches.
 */
export function SkyBackground({ veil = 0, band = false }: SkyBackgroundProps) {
  const insets = useSafeAreaInsets();
  return (
    <SkyBackdrop scene="dusk">
      {veil > 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(colors.cream, veil) }]} /> : null}
      {band ? (
        <LinearGradient
          colors={SKY_BAND.colors}
          locations={SKY_BAND.locations}
          style={[styles.band, { height: BAND_HEIGHT + insets.top }]}
        />
      ) : null}
    </SkyBackdrop>
  );
}

export interface TopBarProps {
  onBack: () => void;
  backLabel: string;
  title?: string;
  right?: ReactNode;
  /** 'band': cream title for the violet band; 'sky': plum title on the pale sky. */
  tone?: 'band' | 'sky';
}

/** Back button, an optional centred title and a right slot, on the sky. */
export function TopBar({ onBack, backLabel, title, right, tone = 'sky' }: TopBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        <GlassIconButton icon="ChevronLeft" label={backLabel} onPress={onBack} iconOffset={-2} testID="top-back" />
      </View>
      <View style={styles.center}>
        {title ? (
          <AppText
            variant="heading"
            color={tone === 'band' ? HEADER_TEXT : colors.plum}
            align="center"
            numberOfLines={1}
            accessibilityRole="header"
            style={tone === 'band' ? glass.headerShadow : null}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: spacing.sm,
  },
  side: { width: 48, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
});
