import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useJournal } from '../../state';
import { colors, spacing } from '../../theme';
import { AppText, Button, Icon } from '../../ui';

type Phase = 'idle' | 'confirm' | 'done';

const CONFIRM_MS = 4000;
const DONE_MS = 2600;

/** Two-tap reset (no Alert: it is a no-op on web). */
export function ResetDemoButton() {
  const { t } = useTranslation();
  const { resetDemo } = useJournal();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (phase === 'idle') return;
    const timer = setTimeout(() => setPhase('idle'), phase === 'confirm' ? CONFIRM_MS : DONE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const onPress = () => {
    if (phase === 'confirm') {
      resetDemo();
      setPhase('done');
    } else {
      setPhase('confirm');
    }
  };

  const color = phase === 'confirm' ? colors.roseDeep : colors.inkSoft;

  return (
    <View style={styles.wrap}>
      <Button
        label={t('profile.resetLabel')}
        variant={phase === 'confirm' ? 'secondary' : 'ghost'}
        size="md"
        fullWidth={false}
        onPress={onPress}
        icon={<Icon name="RotateCcw" size={17} color={color} strokeWidth={2} />}
        // Same border width in both states, so the confirm style doesn't nudge the layout.
        style={[styles.button, phase === 'confirm' ? null : styles.ghostBorder]}
      />
      <View style={styles.messageSlot} accessibilityLiveRegion="polite">
        {phase === 'confirm' ? (
          <Animated.View key="confirm" entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)}>
            <AppText variant="caption" color={colors.roseDeep} align="center">
              {t('profile.resetConfirm')}
            </AppText>
          </Animated.View>
        ) : null}
        {phase === 'done' ? (
          <Animated.View key="done" entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={styles.done}>
            <Icon name="Check" size={14} color={colors.success} strokeWidth={2.25} />
            <AppText variant="caption" color={colors.inkSoft} align="center">
              {t('profile.resetDone')}
            </AppText>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs },
  button: { alignSelf: 'center' },
  ghostBorder: { borderWidth: 1.5, borderColor: 'transparent' },
  messageSlot: { minHeight: 18, justifyContent: 'center' },
  done: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
