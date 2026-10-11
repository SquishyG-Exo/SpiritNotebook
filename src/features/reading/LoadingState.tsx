import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import type { CategoryKey } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText } from '../../ui';
import { EnergyField } from '../../ui/art';
import { BreathingOrb } from './BreathingOrb';
import { EntryQuote } from './EntryQuote';
import { loadingPhrases } from './readingCopy';

const PHRASE_MS = 2500;
const ORB = 120;
/** BreathingOrb lays itself out in a square 1.7× its size. */
const ORB_BOX = ORB * 1.7;
/** A faint, still aura behind the orb; the orb stays the only thing breathing. */
const FIELD = 330;

export interface LoadingStateProps {
  category: CategoryKey;
  icon: string;
  text: string;
  title?: string;
  hasPhoto?: boolean;
}

/** Calm waiting state: a breathing orb, a rotating line of copy and the words being read. */
export function LoadingState({ category, icon, text, title, hasPhoto }: LoadingStateProps) {
  const { t } = useTranslation();
  const phrases = loadingPhrases(t, category);
  const [index, setIndex] = useState(0);
  const count = phrases.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), PHRASE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const phrase = phrases[index % Math.max(count, 1)] ?? '';

  return (
    <View style={styles.root} accessibilityLiveRegion="polite" testID="reading-loading">
      <Animated.View entering={FadeIn.duration(600)} style={styles.orb}>
        <EnergyField size={FIELD} color={colors.lavender} intensity={0.35} animated={false} style={styles.field} />
        <BreathingOrb icon={icon} size={ORB} />
      </Animated.View>

      <View style={styles.phraseBox}>
        <Animated.View key={index} entering={FadeInUp.duration(500)}>
          <AppText variant="heading" color={colors.plum} align="center">
            {phrase}
          </AppText>
        </Animated.View>
      </View>
      <AppText variant="caption" color={colors.inkSoft} align="center">
        {t('reading.loadingCaption')}
      </AppText>

      <Animated.View entering={FadeInUp.delay(250).duration(600)} style={styles.quote}>
        <EntryQuote text={text} title={title} hasPhoto={hasPhoto} maxLines={6} />
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
  field: {
    top: (ORB_BOX - FIELD) / 2,
    left: '50%',
    marginLeft: -FIELD / 2,
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
