import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { AppText } from '../../ui';
import { LotusMark, Monogram, SkyBackdrop } from '../../ui/art';

const LOTUS_HEIGHT = 120;

/**
 * Shown while the passcode requirement is being checked. The sky and the
 * lotus fade in after a short delay, so a fast check shows only the cream
 * page (no flash); the lotus then breathes gently until the app opens.
 */
export function UnlockSplash() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    breath.set(withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  const lotusStyle = useAnimatedStyle(() => ({
    opacity: 0.82 + breath.get() * 0.18,
    transform: [{ scale: 0.97 + breath.get() * 0.04 }],
  }));

  return (
    <View style={styles.root} accessibilityLabel={t('unlock.checking')}>
      <Animated.View entering={FadeIn.duration(700).delay(200)} style={StyleSheet.absoluteFill}>
        <SkyBackdrop scene="home">
          <Monogram size={230} opacity={0.1} style={styles.monogram} />
        </SkyBackdrop>
      </Animated.View>
      <Animated.View entering={FadeIn.duration(500).delay(260)} style={styles.center}>
        <Animated.View style={lotusStyle}>
          <LotusMark height={LOTUS_HEIGHT} />
        </Animated.View>
        <AppText variant="display" color={colors.plum} align="center">
          {t('common.app.name')}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { position: 'absolute', right: -60, bottom: '12%' },
  center: { alignItems: 'center', gap: spacing.md },
});
