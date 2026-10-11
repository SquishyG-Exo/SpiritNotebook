/**
 * Design 4 scenery shared by the entry flow (composer, reading, whispers):
 * the watercolor sky behind the page, frosted glass surfaces, round glass
 * buttons and the top bar that sits on the sky.
 */
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { art } from '../../ui/art/images';

/** Frosted glass; the backdrop blur is a web-only nicety (native shows the translucent fill). */
export const glassBlur: ViewStyle | null =
  Platform.OS === 'web'
    ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as unknown as ViewStyle)
    : null;

/**
 * Design 4's violet sky band behind a header (as on the Search screen): plum
 * at the top, lavender through the subtitle, gone by the first card. The same
 * band the journal screens use, so stack screens read as one family.
 */
const BAND_HEIGHT = 330;
const BAND_COLORS = [
  withAlpha(colors.plum, 0.92),
  withAlpha(colors.lavenderDeep, 0.84),
  withAlpha(gradients.sky[0], 0.36),
  withAlpha(gradients.sky[1], 0),
] as const;
const BAND_STOPS = [0, 0.45, 0.76, 1] as const;

/** Header text over the violet band: warm white with a soft plum shadow. */
export const HEADER_TEXT = colors.cream;
export const HEADER_TEXT_SOFT = withAlpha(colors.cream, 0.94);

/** Light status bar text while a banded screen is focused (no-op on web). */
export function useLightStatusBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      setStatusBarStyle('light', true);
      return () => setStatusBarStyle('dark', true);
    }, [enabled]),
  );
}

export const glass = StyleSheet.create({
  /** Translucent card over the sky. */
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    ...shadow.tile,
  },
  /** A denser card for long reading text. */
  solid: {
    backgroundColor: withAlpha(colors.cream, 0.9),
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    ...shadow.tile,
  },
  pill: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  /** Cormorant defaults to old-style figures; dates, times and "11:11" read better lining. */
  lining: {
    fontVariant: ['lining-nums'],
  },
  /** Legibility for cream text on the band. */
  headerShadow: {
    textShadowColor: withAlpha(colors.plumDeep, 0.45),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
});

export interface SkyBackgroundProps {
  source?: ImageSource | number;
  /** A cream wash over the art (0–1) for calmer, text-heavy pages. */
  veil?: number;
  /** The violet header band (cream header text goes on it). */
  band?: boolean;
}

/**
 * The watercolor sky, fixed behind the page content. A gradient in the
 * painting's colours shows while it loads. Decorative: hidden from assistive
 * tech and never intercepts touches.
 */
export function SkyBackground({ source = art.skyDusk, veil = 0, band = false }: SkyBackgroundProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.passive]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden>
      <LinearGradient colors={[gradients.dusk[2], gradients.dusk[1], gradients.dusk[0]]} style={StyleSheet.absoluteFill} />
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={200} />
      {veil > 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(colors.cream, veil) }]} /> : null}
      {band ? (
        <LinearGradient
          colors={BAND_COLORS}
          locations={BAND_STOPS}
          style={[styles.band, { height: BAND_HEIGHT + insets.top }]}
        />
      ) : null}
    </View>
  );
}

/**
 * Toggle state for the web: react-native-web ignores accessibilityState and RN
 * has no aria-pressed prop, but RNW forwards aria-pressed to the DOM.
 */
export function pressedProp(pressed: boolean | undefined): object {
  return Platform.OS === 'web' && pressed !== undefined ? { 'aria-pressed': pressed } : {};
}

export interface RoundButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconColor?: string;
  /** Filled icon (e.g. a saved heart). */
  fill?: string;
  size?: number;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** A round frosted-glass icon button: back, heart, share. */
export function RoundButton({
  icon,
  label,
  onPress,
  iconColor = colors.plum,
  fill,
  size = 44,
  selected,
  disabled,
  testID,
  style,
}: RoundButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      {...pressedProp(selected)}
      testID={testID}
      style={[
        styles.round,
        glassBlur,
        { width: size, height: size, borderRadius: size / 2 },
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={iconColor} fill={fill ?? 'none'} strokeWidth={1.9} />
    </PressableScale>
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
        <RoundButton icon="ChevronLeft" label={backLabel} onPress={onBack} testID="top-back" />
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
  passive: {
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.74),
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.92),
    ...shadow.card,
  },
  disabled: { opacity: 0.5 },
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
