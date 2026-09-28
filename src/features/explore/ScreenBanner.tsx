import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, shadow, spacing , withAlpha } from '../../theme';
import { AppText, goBackOrHome, Icon } from '../../ui';
import { DreamBanner, type DreamBannerProps } from '../../ui/art';

/** Frosted glass for the back button over the artwork; the backdrop blur is a web-only nicety. */
const glassBlur =
  Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as unknown as ViewStyle) : null;

export interface ScreenBannerProps {
  /** Height of the artwork below the status bar. */
  height: number;
  /** Optional title, centred in the header row over the artwork. */
  title?: string;
  butterflies?: DreamBannerProps['butterflies'];
  sparkles?: boolean;
  /** Defaults to router.back(), falling back to Home. */
  onBack?: () => void;
}

/**
 * Full-bleed dawn dreamscape at the top of a stack screen, fading into the
 * page, with the header (back button, optional title) laid over it. Place it
 * as the first child of a padded <Screen>: it cancels the gutter and runs up
 * under the status bar.
 */
export function ScreenBanner({ height, title, butterflies = 'few', sparkles = true, onBack }: ScreenBannerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <DreamBanner
      variant="dawn"
      height={height + insets.top}
      butterflies={butterflies}
      sparkles={sparkles}
      style={[styles.bleed, { marginTop: -insets.top }]}
      contentStyle={[styles.content, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          <Pressable
            onPress={onBack ?? goBackOrHome}
            accessibilityRole="button"
            accessibilityLabel={t('common.actions.back')}
            hitSlop={8}
            style={({ pressed }) => [styles.back, glassBlur, pressed ? styles.pressed : null]}>
            <Icon name="ChevronLeft" size={24} color={colors.ink} strokeWidth={2} style={styles.chevron} />
          </Pressable>
        </View>
        <View style={styles.center}>
          {title ? (
            <AppText variant="heading" align="center" numberOfLines={1}>
              {title}
            </AppText>
          ) : null}
        </View>
        <View style={styles.side} />
      </View>
    </DreamBanner>
  );
}

const BACK = 44;

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -layout.gutter,
  },
  content: {
    justifyContent: 'flex-start',
    paddingHorizontal: layout.gutter,
  },
  // Same geometry as the shared <Header>, so titles sit where they did before.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: spacing.sm,
  },
  side: {
    width: BACK,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    width: BACK,
    height: BACK,
    borderRadius: BACK / 2,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.72),
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.9),
    ...shadow.card,
  },
  chevron: {
    marginLeft: -2,
  },
  pressed: {
    opacity: 0.7,
  },
});
