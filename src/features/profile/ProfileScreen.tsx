import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '../../state';
import { colors, fonts, gradients, layout, spacing, withAlpha } from '../../theme';
import { AppText, goBackOrHome, Icon, type IconName } from '../../ui';
import { Monogram, SkyBackdrop } from '../../ui/art';
import { GLASS_BUTTON_SIZE, GlassIconButton } from '../home/GlassIconButton';
import { GlassCard, SectionTitle } from './GlassCard';
import { LabCard } from './LabCard';
import { LanguageSwitch } from './LanguageSwitch';
import { ResetDemoButton } from './ResetDemoButton';

const AVATAR = 64;
const BENEFIT_DISC = 42;
const MONOGRAM_SIZE = 220;
const VERSION = '0.1';

/** The five benefits from the client's welcome screen, in her order. */
const BENEFITS: readonly { key: 'decode' | 'clarity' | 'path' | 'journal' | 'connected'; icon: IconName }[] = [
  { key: 'decode', icon: 'Moon' },
  { key: 'clarity', icon: 'Heart' },
  { key: 'path', icon: 'Sun' },
  { key: 'journal', icon: 'Feather' },
  { key: 'connected', icon: 'Star' },
];

const PILLARS = ['notice', 'reflect', 'understand', 'grow'] as const;

/** Profile and settings (a stack screen opened from Home's gear and avatar). */
export function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const name = t('profile.guestName');

  return (
    <View style={styles.root}>
      <SkyBackdrop scene="dusk">
        <Monogram size={MONOGRAM_SIZE} opacity={0.13} style={[styles.monogram, { top: insets.top + 4 }]} />
      </SkyBackdrop>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <GlassIconButton
            icon="ChevronLeft"
            label={t('common.actions.back')}
            onPress={goBackOrHome}
            iconOffset={-2}
            testID="profile-back"
          />
          <AppText variant="heading" color={colors.plum} align="center" accessibilityRole="header" style={styles.title}>
            {t('profile.title')}
          </AppText>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.stack}>
          <Reveal order={0}>
            <GlassCard style={styles.identity}>
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
                <AppText variant="heading" color={colors.plum}>
                  {name}
                </AppText>
                <AppText variant="small" color={colors.muted}>
                  {t('profile.guestSubtitle')}
                </AppText>
              </View>
            </GlassCard>
          </Reveal>

          <Reveal order={1}>
            <GlassCard style={styles.card}>
              <SectionTitle icon="Languages" title={t('common.language.label')} />
              <LanguageSwitch value={language} onChange={setLanguage} />
              <AppText variant="small" color={colors.muted}>
                {t('profile.languageHint')}
              </AppText>
            </GlassCard>
          </Reveal>

          <Reveal order={2}>
            <GlassCard style={styles.card}>
              <AppText variant="heading" color={colors.plum} accessibilityRole="header">
                {t('profile.aboutTitle')}
              </AppText>
              <View style={styles.benefits}>
                {BENEFITS.map((benefit) => (
                  <View key={benefit.key} style={styles.benefit}>
                    <View style={styles.benefitDisc}>
                      <Icon name={benefit.icon} size={20} color={colors.gold} strokeWidth={1.6} />
                    </View>
                    <View style={styles.benefitText}>
                      <AppText style={styles.benefitTitle}>{t(`profile.benefits.${benefit.key}.title`)}</AppText>
                      <AppText variant="small" color={colors.muted}>
                        {t(`profile.benefits.${benefit.key}.body`)}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.divider} />
              <View style={styles.pillars}>
                {PILLARS.map((pillar, index) => (
                  <Fragment key={pillar}>
                    {index > 0 ? <View style={styles.pillarDot} /> : null}
                    <AppText variant="overline" color={colors.goldDeep} style={styles.pillar}>
                      {t(`common.pillars.${pillar}`)}
                    </AppText>
                  </Fragment>
                ))}
              </View>
            </GlassCard>
          </Reveal>

          <Reveal order={3}>
            <LabCard />
          </Reveal>

          <Reveal order={4}>
            <GlassCard style={styles.card}>
              <SectionTitle icon="CircleAlert" title={t('common.disclaimer.title')} />
              <AppText variant="small" color={colors.muted}>
                {t('common.disclaimer.body')}
              </AppText>
            </GlassCard>
          </Reveal>

          <Reveal order={5}>
            <View style={styles.footer}>
              <ResetDemoButton />
              <AppText variant="caption" color={colors.inkSoft} align="center">
                {t('profile.version', { version: VERSION })}
              </AppText>
            </View>
          </Reveal>
        </View>
      </ScrollView>
    </View>
  );
}

function Reveal({ order, children, style }: { order: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInUp.duration(440).delay(60 + order * 70)} style={style}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  fill: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  monogram: { position: 'absolute', right: -MONOGRAM_SIZE * 0.22 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -4 },
  title: { flex: 1 },
  topBarSpacer: { width: GLASS_BUTTON_SIZE },
  stack: { gap: spacing.lg, marginTop: spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.goldLight,
  },
  initial: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.plum },
  identityText: { flex: 1, gap: 2 },
  card: { gap: spacing.lg },
  benefits: { gap: spacing.lg },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md + 2 },
  benefitDisc: {
    width: BENEFIT_DISC,
    height: BENEFIT_DISC,
    borderRadius: BENEFIT_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.8),
    borderWidth: 1,
    borderColor: withAlpha(colors.goldLight, 0.6),
  },
  benefitText: { flex: 1, gap: 2 },
  benefitTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.plum },
  divider: { height: 1, backgroundColor: withAlpha(colors.plum, 0.1) },
  // Borrows the card's side padding and a tighter overline so the four words stay on one line at 360 px
  // (Spanish included).
  pillars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: spacing.xs,
    marginHorizontal: -spacing.md,
  },
  pillar: { fontSize: 10.5, letterSpacing: 0.9 },
  pillarDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 5,
    backgroundColor: colors.gold,
  },
  footer: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm },
});
