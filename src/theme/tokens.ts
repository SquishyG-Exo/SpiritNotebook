import { brand } from '../../brand/config';

export const colors = brand.colors;
export const gradients = brand.gradients;
export const fonts = brand.fonts;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

/** Cross-platform box shadows (RN 0.76+ `boxShadow`, mapped to CSS on web). */
export const shadow = {
  soft: { boxShadow: '0 8px 24px rgba(62, 42, 90, 0.08)' },
  card: { boxShadow: '0 4px 16px rgba(62, 42, 90, 0.06)' },
  lifted: { boxShadow: '0 14px 34px rgba(62, 42, 90, 0.14)' },
  glow: { boxShadow: '0 10px 30px rgba(200, 105, 138, 0.28)' },
} as const;

/** Typography presets. Use through <AppText variant="..."> when possible. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.6 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 25 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  smallMedium: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  button: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 20 },
  quote: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 28 },
} as const;

export type TypeVariant = keyof typeof type;

/** Layout constants shared by screens. */
export const layout = {
  /** Horizontal page gutter. */
  gutter: 20,
  /** Height of the custom tab bar, excluding the safe-area inset. */
  tabBarHeight: 64,
  /** Max content width on wide screens (the desktop phone frame is narrower anyway). */
  maxWidth: 520,
} as const;
