import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, gradients, shadow, spacing } from '../../theme';
import { AppText } from '../../ui';
import { Dreamscape } from '../../ui/art';

/**
 * Shown while the passcode requirement is being checked. The scenery and the
 * content fade in after a short delay, so a fast check shows only the cream
 * page (no flash). A faint dawn scene echoes the Unlock screen's dusk.
 */
export function UnlockSplash() {
  const { t } = useTranslation();
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [breath]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + breath.get() * 0.3,
    transform: [{ scale: 0.94 + breath.get() * 0.08 }],
  }));

  return (
    <View style={styles.root} accessibilityLabel={t('unlock.checking')}>
      <Animated.View pointerEvents="none" entering={FadeIn.duration(600).delay(200)} style={StyleSheet.absoluteFill}>
        <View style={styles.scenery}>
          <Dreamscape variant="dawn" />
        </View>
      </Animated.View>
      <Animated.View entering={FadeIn.duration(420).delay(200)} style={styles.center}>
        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient
            colors={gradients.dusk}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <AppText variant="title" align="center">
          {t('common.app.name')}
        </AppText>
      </Animated.View>
    </View>
  );
}

const ORB = 64;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Low intensity, and taller than the screen so the sun rises near the bottom edge
  // instead of sitting under the title: only its rays reach up behind the orb.
  scenery: { position: 'absolute', top: 0, left: 0, right: 0, height: '135%', opacity: 0.45 },
  center: { alignItems: 'center', gap: spacing.lg },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    overflow: 'hidden',
    ...shadow.glow,
  },
});
