import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, gradients, shadow, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale, type IconName } from '../../ui';
import { glass, HEADER_TEXT, HEADER_TEXT_SOFT } from './glass';

const BUTTON = 44;

/** How far down the violet band reaches, from the top of the screen (below the safe-area inset). */
const BAND_HEIGHT = 338;
/** Reaches past the page gutter to the window edges; the scroll view clips the rest. */
const BAND_BLEED = 480;
/**
 * Design 4's violet sky behind the header: plum at the top, lavender through
 * the subtitle (cream text stays above 4.5:1), fading out by the first card.
 */
const BAND_COLORS = [
  withAlpha(colors.plum, 0.92),
  withAlpha(colors.lavenderDeep, 0.84),
  withAlpha(gradients.sky[0], 0.36),
  withAlpha(gradients.sky[1], 0),
] as const;
const BAND_STOPS = [0, 0.45, 0.76, 1] as const;

export interface HeaderButtonProps {
  icon: IconName;
  /** Screen-reader label (the button has no visible text). */
  label: string;
  onPress: () => void;
  /** Nudges the glyph; chevrons look off-centre otherwise. */
  iconOffset?: number;
  testID?: string;
}

/** Round frosted button for the header row (back, profile): the same glass as Home's top bar. */
export function HeaderButton({ icon, label, onPress, iconOffset = 0, testID }: HeaderButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={styles.button}>
      <Icon
        name={icon}
        size={22}
        color={colors.plum}
        strokeWidth={1.75}
        style={iconOffset ? { marginLeft: iconOffset } : undefined}
      />
    </PressableScale>
  );
}

/** Top-right avatar that opens Profile, as on Design 4. */
export function ProfileButton() {
  const { t } = useTranslation();
  return <HeaderButton icon="CircleUserRound" label={t('common.tabs.profile')} onPress={() => router.push('/profile')} />;
}

export interface SkyHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back button on the left. */
  onBack?: () => void;
  /** Left of the top row when there is no back button (e.g. the Calendar's Today pill). */
  left?: ReactNode;
  /** Right of the top row (e.g. ProfileButton). */
  right?: ReactNode;
  /** Small element under the title, such as the Premium chip. */
  badge?: ReactNode;
  /** Controls under the subtitle (search field, chips). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Design 4 header over the violet sky band: a row of round glass buttons, a
 * centred serif title in warm white and a short subtitle.
 */
export function SkyHeader({ title, subtitle, onBack, left, right, badge, children, style }: SkyHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, style]}>
      {/* Scrolls with the header, from the very top of the screen. */}
      <LinearGradient
        colors={BAND_COLORS}
        locations={BAND_STOPS}
        style={[styles.band, { top: -(insets.top + spacing.sm), height: BAND_HEIGHT + insets.top }]}
      />
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <HeaderButton icon="ChevronLeft" label={t('common.actions.back')} onPress={onBack} iconOffset={-2} />
          ) : (
            left
          )}
        </View>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>

      <Animated.View entering={FadeIn.duration(420)} style={styles.titleBlock}>
        <AppText
          variant="display"
          color={HEADER_TEXT}
          align="center"
          accessibilityRole="header"
          numberOfLines={2}
          style={[styles.title, glass.headerShadow]}>
          {title}
        </AppText>
        {badge}
        {subtitle ? (
          <AppText align="center" color={HEADER_TEXT_SOFT} style={[styles.subtitle, glass.headerShadow]}>
            {subtitle}
          </AppText>
        ) : null}
      </Animated.View>

      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.sm },
  band: { position: 'absolute', left: -BAND_BLEED, right: -BAND_BLEED, pointerEvents: 'none' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: BUTTON,
  },
  side: { minWidth: BUTTON, flexDirection: 'row', alignItems: 'center' },
  sideRight: { justifyContent: 'flex-end' },
  // Pulled up into the button row, as in Design 4, so the header stays compact.
  titleBlock: { alignItems: 'center', gap: spacing.xs, marginTop: -spacing.md },
  // Clear of the round buttons on either side.
  title: { fontSize: 38, lineHeight: 44, paddingHorizontal: BUTTON, fontVariant: ['lining-nums'] },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21, maxWidth: 330 },
  children: { marginTop: spacing.xl, gap: spacing.lg },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.62),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.tile,
  },
});
