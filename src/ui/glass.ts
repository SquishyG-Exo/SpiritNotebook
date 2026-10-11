import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { colors, fonts, gradients, radius, shadow, withAlpha } from '../theme';

/**
 * Design 4 surfaces over the watercolor sky: frosted glass, the violet header
 * band, and the cream header text that sits on it. Shared by every sky screen.
 */

/** Frosted glass; the backdrop blur is a web-only nicety (native shows the translucent fill). */
export const glassBlur: ViewStyle | null =
  Platform.OS === 'web'
    ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as unknown as ViewStyle)
    : null;

/** Header text over the violet band: warm white with a soft plum shadow (glass.headerShadow). */
export const HEADER_TEXT = colors.cream;
export const HEADER_TEXT_SOFT = withAlpha(colors.cream, 0.94);

/**
 * Design 4's violet sky band behind a header (as on the Search screen): plum
 * at the top, lavender through the subtitle (cream text stays above 4.5:1),
 * gone by the first card. For an expo-linear-gradient's colors and locations.
 */
export const SKY_BAND = {
  colors: [
    withAlpha(colors.plum, 0.92),
    withAlpha(colors.lavenderDeep, 0.84),
    withAlpha(gradients.sky[0], 0.36),
    withAlpha(gradients.sky[1], 0),
  ],
  locations: [0, 0.45, 0.76, 1],
} as const;

export const glass = StyleSheet.create({
  /** Translucent card over the sky (entries, whispers, empty states). */
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
  /** Controls that hold text input or need a firmer surface (search field, month card). */
  firm: {
    backgroundColor: withAlpha(colors.white, 0.88),
    borderColor: colors.glassBorder,
    borderWidth: 1,
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
  /** Serif section heading on the sky ("Results from your Notebook", month names). */
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.1,
    color: colors.plumDeep,
    fontVariant: ['lining-nums'],
  },
  /** Count or hint beside a section title. */
  sectionMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
});
