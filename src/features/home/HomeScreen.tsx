import { router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJournal } from '../../state';
import { colors, gradients, layout, spacing , withAlpha } from '../../theme';
import { AppText, Button, IconCircle } from '../../ui';
import { DuskScene } from './DuskScene';
import { greetingKeyFor } from './greeting';
import { LatestEntryCard } from './LatestEntryCard';

const PILLARS = ['notice', 'reflect', 'understand', 'grow'] as const;

const enter = (delay: number) => FadeInUp.delay(delay).duration(700);

/** Greeting bucket, refreshed whenever Home comes back into focus. */
function useGreeting() {
  const [greeting, setGreeting] = useState(() => greetingKeyFor(new Date()));
  useFocusEffect(
    useCallback(() => {
      setGreeting(greetingKeyFor(new Date()));
    }, []),
  );
  return greeting;
}

export function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { savedEntries } = useJournal();
  const greeting = useGreeting();
  // Where the hero text ends, so the scene keeps its butterflies in the open sky below it.
  const [heroBottom, setHeroBottom] = useState<number>();

  return (
    <View style={styles.root}>
      <DuskScene clearTop={heroBottom} />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        <View
          style={styles.hero}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            // A covered screen (display: none on web) reports an empty layout: keep the last real one.
            if (height > 0) setHeroBottom(Math.round(y + height));
          }}>
          <Animated.View entering={enter(60)}>
            <AppText variant="overline" color={withAlpha(colors.cream, 0.8)} align="center">
              {t(`home.greeting.${greeting}`)}
            </AppText>
          </Animated.View>

          <Animated.View entering={enter(160)}>
            <AppText variant="hero" color={colors.cream} align="center" style={[styles.shadow, styles.title]}>
              {t('common.app.name')}
            </AppText>
          </Animated.View>

          <Animated.View entering={enter(260)}>
            <AppText
              variant="quote"
              color={withAlpha(colors.cream, 0.92)}
              align="center"
              style={[styles.shadow, styles.tagline]}>
              {t('common.app.tagline')}
            </AppText>
          </Animated.View>

          <Animated.View entering={enter(360)} style={styles.pillars}>
            {PILLARS.map((pillar, index) => (
              <Fragment key={pillar}>
                {index > 0 ? <View style={styles.pillarDot} /> : null}
                <AppText variant="overline" color={withAlpha(colors.cream, 0.72)} style={styles.pillar}>
                  {t(`common.pillars.${pillar}`)}
                </AppText>
              </Fragment>
            ))}
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          <Animated.View entering={enter(500)}>
            <LatestEntryCard entry={savedEntries[0]} />
          </Animated.View>
          <Animated.View entering={enter(620)}>
            <Button
              variant="light"
              label={t('common.actions.newEntry')}
              onPress={() => router.push('/explore')}
              icon={<IconCircle name="Plus" size={28} tint={colors.roseDeep} color={colors.white} strokeWidth={2.4} />}
              testID="home-new-entry"
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: gradients.night[0],
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
  },
  shadow: {
    textShadowColor: withAlpha(colors.navyDeep, 0.35),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  title: {
    marginTop: spacing.sm,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 330,
  },
  pillars: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: spacing.xs,
  },
  pillar: {
    letterSpacing: 1.2,
  },
  pillarDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: spacing.sm,
    backgroundColor: withAlpha(colors.cream, 0.55),
  },
  bottom: {
    gap: spacing.md,
  },
});
