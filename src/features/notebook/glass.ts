import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { colors, fonts, radius, shadow, withAlpha } from '../../theme';

/** Frosted glass over the sky. The backdrop blur is a web-only nicety; native shows the translucent fill. */
export const glassBlur: ViewStyle | null =
  Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as unknown as ViewStyle) : null;

/** Header text over the violet band (Design 4): warm white with a soft plum shadow for legibility. */
export const HEADER_TEXT = colors.cream;
export const HEADER_TEXT_SOFT = withAlpha(colors.cream, 0.94);

export const glass = StyleSheet.create({
  /** Cards and tiles over the sky (entries, whispers, empty states). */
  card: {
    backgroundColor: colors.glass,
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
