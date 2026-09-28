import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { AppText } from '../../ui';
import { BreathingOrb } from './BreathingOrb';
import { EntryQuote } from './EntryQuote';

const PHRASE_MS = 2500;

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export interface LoadingStateProps {
  icon: string;
  text: string;
  hasPhoto?: boolean;
}

/** Calm waiting state: a breathing orb, a rotating line of copy and the words being read. */
export function LoadingState({ icon, text, hasPhoto }: LoadingStateProps) {
  const { t } = useTranslation();
  const phrases = asList(t('reading.loading', { returnObjects: true }));
  const [index, setIndex] = useState(0);
  const count = phrases.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), PHRASE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const phrase = phrases[index % Math.max(count, 1)] ?? '';

  return (
    <View style={styles.root} accessibilityLiveRegion="polite">
      <Animated.View entering={FadeIn.duration(600)} style={styles.orb}>
        <BreathingOrb icon={icon} />
      </Animated.View>

      <View style={styles.phraseBox}>
        <Animated.View key={index} entering={FadeInUp.duration(500)}>
          <AppText variant="heading" align="center">
            {phrase}
          </AppText>
        </Animated.View>
      </View>
      <AppText variant="caption" color={colors.muted} align="center">
        {t('reading.loadingCaption')}
      </AppText>

      <Animated.View entering={FadeInUp.delay(250).duration(600)} style={styles.quote}>
        <EntryQuote text={text} hasPhoto={hasPhoto} maxLines={6} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'stretch',
    paddingTop: spacing.lg,
  },
  orb: {
    alignItems: 'center',
  },
  phraseBox: {
    minHeight: 30,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    justifyContent: 'center',
  },
  quote: {
    marginTop: spacing.xxxl,
  },
});
