import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useSettings } from '../../state';
import { colors, fonts, gradients, layout, spacing } from '../../theme';
import { AppText, Card, Icon, IconCircle, Screen, type IconName } from '../../ui';
import { CornerButterfly, DreamBanner, EnergyField, Sparkles, type SparkleSpec } from '../../ui/art';
import { LabCard } from './LabCard';
import { LanguageSwitch } from './LanguageSwitch';
import { ResetDemoButton } from './ResetDemoButton';

const AVATAR = 72;
/** Cover art behind the title; the identity card overlaps its bottom edge like a profile cover. */
const COVER_HEIGHT = 150;
const COVER_OVERLAP = 36;
/** Clear of the title (top left) and the corner butterfly (top right). */
const COVER_SPARKLES: SparkleSpec[] = [
  { x: 0.52, y: 0.14, size: 9, delay: 0 },
  { x: 0.72, y: 0.46, size: 11, delay: 900 },
  { x: 0.16, y: 0.56, size: 8, delay: 1600 },
];
/** Faint rose glow behind the "What Spirit Notebook is" card; it shows in the gutters. */
const ABOUT_GLOW = 560;
const VERSION = '0.1';

const PILLARS: readonly { key: 'notice' | 'reflect' | 'understand' | 'grow'; icon: IconName }[] = [
  { key: 'notice', icon: 'Eye' },
  { key: 'reflect', icon: 'Heart' },
  { key: 'understand', icon: 'Lightbulb' },
  { key: 'grow', icon: 'Sprout' },
];

export function ProfileScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();

  const name = t('profile.guestName');
  const rawBullets: unknown = t('profile.aboutBullets', { returnObjects: true });
  const bullets = Array.isArray(rawBullets) ? rawBullets.filter((b): b is string => typeof b === 'string') : [];

  return (
    <Screen scroll>
      <DreamBanner
        variant="dawn"
        height={COVER_HEIGHT}
        rounded={false}
        butterflies="none"
        sparkles={false}
        style={styles.cover}
        contentStyle={styles.coverContent}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Sparkles sparkles={COVER_SPARKLES} />
          <CornerButterfly corner="top-right" inset={16} size={48} rotation={-14} />
        </View>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            {t('profile.title')}
          </AppText>
        </View>
      </DreamBanner>

      <View style={styles.stack}>
        <Reveal order={0}>
          <Card style={styles.identity}>
            <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <LinearGradient
                colors={gradients.dusk}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <AppText style={styles.initial}>{name.charAt(0).toLocaleUpperCase()}</AppText>
            </View>
            <View style={styles.identityText}>
              <AppText variant="heading">{name}</AppText>
              <AppText variant="small" color={colors.muted}>
                {t('profile.guestSubtitle')}
              </AppText>
            </View>
          </Card>
        </Reveal>

        {/* Above the About glow, which would otherwise paint over its lower edge. */}
        <Reveal order={1} style={styles.raised}>
          <Card style={styles.card}>
            <View style={styles.labelRow}>
              <Icon name="Languages" size={18} color={colors.lavenderDeep} />
              <AppText variant="subheading">{t('common.language.label')}</AppText>
            </View>
            <LanguageSwitch value={language} onChange={setLanguage} />
            <AppText variant="small" color={colors.muted}>
              {t('profile.languageHint')}
            </AppText>
          </Card>
        </Reveal>

        <Reveal order={2} style={styles.raised}>
          <LabCard />
        </Reveal>

        <Reveal order={2}>
          <EnergyField size={ABOUT_GLOW} color={colors.rose} intensity={0.34} animated={false} style={styles.aboutGlow} />
          <Card style={styles.card}>
            <AppText variant="heading" accessibilityRole="header">
              {t('profile.aboutTitle')}
            </AppText>
            <View style={styles.pillars}>
              {PILLARS.map((pillar) => (
                <View key={pillar.key} style={styles.pillar}>
                  <IconCircle name={pillar.icon} size={48} tint={colors.roseSoft} color={colors.roseDeep} />
                  <AppText variant="caption" color={colors.inkSoft} align="center" numberOfLines={1} style={styles.pillarLabel}>
                    {t(`common.pillars.${pillar.key}`)}
                  </AppText>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.bullets}>
              {bullets.map((bullet) => (
                <View key={bullet} style={styles.bullet}>
                  <View style={styles.check}>
                    <Icon name="Check" size={13} color={colors.roseDeep} strokeWidth={2.5} />
                  </View>
                  <AppText variant="body" color={colors.inkSoft} style={styles.bulletText}>
                    {bullet}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        </Reveal>

        <Reveal order={3}>
          <Card tint={colors.surfaceTint} elevated={false} style={styles.card}>
            <View style={styles.labelRow}>
              <Icon name="CircleAlert" size={18} color={colors.roseDeep} />
              <AppText variant="subheading">{t('common.disclaimer.title')}</AppText>
            </View>
            <AppText variant="small" color={colors.muted}>
              {t('common.disclaimer.body')}
            </AppText>
          </Card>
        </Reveal>

        <Reveal order={4}>
          <View style={styles.footer}>
            <ResetDemoButton />
            <AppText variant="caption" color={colors.muted} align="center">
              {t('profile.version', { version: VERSION })}
            </AppText>
          </View>
        </Reveal>
      </View>
    </Screen>
  );
}

function Reveal({ order, children, style }: { order: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInUp.duration(440).delay(50 + order * 70)} style={style}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Full-bleed: undo the Screen gutter.
  cover: { marginHorizontal: -layout.gutter },
  coverContent: { justifyContent: 'flex-start' },
  header: { paddingTop: spacing.xl, paddingHorizontal: layout.gutter },
  // The identity card rides up over the cover's faded bottom edge.
  stack: { gap: spacing.lg, marginTop: -COVER_OVERLAP },
  raised: { zIndex: 1 },
  aboutGlow: { left: '50%', top: '50%', marginLeft: -ABOUT_GLOW / 2, marginTop: -ABOUT_GLOW / 2 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  initial: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink },
  identityText: { flex: 1, gap: 2 },
  card: { gap: spacing.lg },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Borrow the card's side padding so "Understand" / "Comprende" fit at 360 px.
  pillars: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -spacing.md },
  pillar: { flex: 1, alignItems: 'center', gap: spacing.sm },
  pillarLabel: { letterSpacing: 0 },
  divider: { height: 1, backgroundColor: colors.hairline },
  bullets: { gap: spacing.md },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.roseSoft,
  },
  bulletText: { flex: 1 },
  footer: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm },
});
