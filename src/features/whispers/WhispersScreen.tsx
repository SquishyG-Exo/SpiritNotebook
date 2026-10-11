import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Platform, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { whispers } from '../../../brand/whispers';
import { useJournal, useSettings } from '../../state';
import { colors, fonts, layout, radius, spacing, withAlpha } from '../../theme';
import { AppText, Button, goBackOrHome, Icon, Screen } from '../../ui';
import { art } from '../../ui/art/images';
import { firstParam } from '../entry/params';
import { glass, glassBlur, RoundButton, SkyBackground, TopBar } from '../entry/scenery';
import { LotusGlow } from './LotusGlow';
import { pickAnother, resolveWhisper } from './whisperModel';

const LOTUS_HEIGHT = 78;
const GLOW = 170;
const FADE_OUT_MS = 220;
const FADE_IN_MS = 480;

/** navigator.share exists on most phones' browsers; desktop browsers often lack it. */
function canShareOnWeb(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Whispers of Wisdom (/whispers?id=): one uplifting message at a time, original
 * writing that may echo a teacher's ideas ("In the spirit of …"), never a quote.
 */
export function WhispersScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { language } = useSettings();
  const { savedWhispers, toggleWhisper } = useJournal();
  const reduceMotion = useReducedMotion();

  const [today] = useState(() => new Date());
  const whisper = resolveWhisper(firstParam(params.id), today);
  const saved = savedWhispers.includes(whisper.id);
  const text = whisper.text[language] ?? whisper.text.en;
  const author = whisper.inspiredBy?.author;
  const canShare = Platform.OS !== 'web' || canShareOnWeb();

  // Soft crossfade between whispers: fade out, swap (the URL keeps the current one), fade in.
  const opacity = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    },
    [],
  );

  const another = () => {
    if (swapTimer.current) return;
    const next = pickAnother(whisper.id);
    if (reduceMotion) {
      router.setParams({ id: next.id });
      return;
    }
    opacity.set(withTiming(0, { duration: FADE_OUT_MS }));
    swapTimer.current = setTimeout(() => {
      swapTimer.current = null;
      router.setParams({ id: next.id });
      opacity.set(withTiming(1, { duration: FADE_IN_MS }));
    }, FADE_OUT_MS + 20);
  };

  const toggleSaved = () => {
    toggleWhisper(whisper.id);
    AccessibilityInfo.announceForAccessibility(saved ? t('whispers.removed') : t('whispers.saved'));
  };

  const share = async () => {
    const message = author ? `${text}\n\n${t('whispers.inSpiritOf', { author })}` : text;
    try {
      if (Platform.OS === 'web') await navigator.share({ title: t('whispers.title'), text: message });
      else await Share.share({ message });
    } catch {
      // Dismissed or unavailable: nothing to do.
    }
  };

  return (
    <View style={styles.fill}>
      <SkyBackground />
      <Screen scroll background="transparent" edges={['top', 'bottom']} contentStyle={styles.content}>
        <TopBar onBack={goBackOrHome} backLabel={t('common.actions.back')} />

        <View style={styles.body}>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.hero}>
            <View style={styles.lotus}>
              <LotusGlow size={GLOW} style={styles.glow} />
              <Image
                source={art.lotus}
                contentFit="contain"
                accessible={false}
                alt=""
                style={{ width: Math.round(LOTUS_HEIGHT * art.lotusAspect), height: LOTUS_HEIGHT }}
              />
            </View>
            <AppText variant="display" color={colors.plum} align="center" accessibilityRole="header">
              {t('whispers.title')}
            </AppText>
            <AppText variant="small" color={colors.inkSoft} align="center" style={styles.subtitle}>
              {t('whispers.subtitle')}
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(120).duration(550)}>
            <Animated.View
              style={[glass.card, glassBlur, styles.card, fadeStyle]}
              accessibilityLiveRegion="polite"
              testID="whisper-card">
              <Icon name="Sparkle" size={16} color={colors.gold} strokeWidth={1.8} />
              <AppText style={styles.whisper} align="center" testID="whisper-text">
                {text}
              </AppText>
              {author ? (
                <View style={styles.attribution}>
                  <View style={styles.rule} />
                  <AppText variant="smallMedium" color={colors.goldDeep} align="center" testID="whisper-author">
                    {t('whispers.inSpiritOf', { author })}
                  </AppText>
                  {whisper.inspiredBy?.work ? (
                    <AppText style={styles.work} color={colors.muted} align="center">
                      {whisper.inspiredBy.work}
                    </AppText>
                  ) : null}
                </View>
              ) : null}
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(220).duration(550)} style={styles.actions}>
            <RoundButton
              icon="Heart"
              size={54}
              label={saved ? t('whispers.unsave') : t('whispers.save')}
              onPress={toggleSaved}
              iconColor={saved ? colors.roseDeep : colors.plum}
              fill={saved ? colors.roseDeep : undefined}
              selected={saved}
              testID="whisper-save"
            />
            <Button
              label={t('whispers.another')}
              onPress={another}
              disabled={whispers.length < 2}
              icon={<Icon name="RefreshCw" size={18} color={colors.white} />}
              style={styles.anotherButton}
              testID="whisper-another"
            />
            {canShare ? (
              <RoundButton icon="Share2" size={54} label={t('whispers.share')} onPress={share} testID="whisper-share" />
            ) : null}
          </Animated.View>

          <AppText variant="caption" color={colors.inkSoft} align="center" style={styles.savedNote}>
            {saved ? t('whispers.savedNote') : ' '}
          </AppText>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    flexGrow: 1,
  },
  /** Hero, card and actions sit centred in the space under the top bar. */
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  lotus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  glow: {
    top: (LOTUS_HEIGHT - GLOW) / 2,
    left: (Math.round(LOTUS_HEIGHT * art.lotusAspect) - GLOW) / 2,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 230,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    borderRadius: radius.xl,
  },
  whisper: {
    fontVariant: ['lining-nums'],
    fontFamily: fonts.displayItalic,
    fontSize: 26,
    lineHeight: 35,
    color: colors.plum,
  },
  attribution: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rule: {
    width: 36,
    height: 1,
    backgroundColor: withAlpha(colors.gold, 0.6),
    marginBottom: spacing.sm,
  },
  work: {
    fontVariant: ['lining-nums'],
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  anotherButton: {
    flex: 1,
  },
  savedNote: {
    marginTop: spacing.md,
  },
});
