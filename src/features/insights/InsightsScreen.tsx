import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { insights } from '../../../brand/insights';
import { useJournal, useSettings } from '../../state';
import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { AppText, Chip, Icon, IconCircle } from '../../ui';
import { formatMonthName, monthOf } from '../calendar/calendarModel';
import { glass, glassBlur } from '../notebook/glass';
import { PremiumChip } from '../notebook/PremiumChip';
import { SkyHeader } from '../notebook/SkyHeader';
import { SkyPage, skyPage, useSkyPadding } from '../notebook/SkyPage';
import { GlanceCard } from './GlanceCard';
import { computeInsightStats } from './insightsModel';
import { WeeklyBars } from './WeeklyBars';

/** Insights is reached from the Notebook's patterns card; a cold start goes back there. */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/notebook');
}

/** Premium Insights preview: computed counts from the journal plus mocked patterns from brand/insights.ts. */
export function InsightsScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries } = useJournal();
  const padding = useSkyPadding('stack');
  const [now] = useState(() => new Date());
  const stats = useMemo(() => computeInsightStats(savedEntries, now), [savedEntries, now]);
  const monthName = formatMonthName(monthOf(now), language);

  const themes = insights.themes;
  const symbols = insights.symbols[language] ?? insights.symbols.en;
  const summary = insights.summary[language] ?? insights.summary.en;
  const journey = insights.journey[language] ?? insights.journey.en;

  return (
    <SkyPage>
      <ScrollView
        style={skyPage.scroll}
        contentContainerStyle={[skyPage.content, padding]}
        showsVerticalScrollIndicator={false}>
        <SkyHeader
          title={t('insights.title')}
          subtitle={t('insights.subtitle')}
          onBack={goBack}
          badge={<PremiumChip onDark style={styles.badge} />}
        />

        <View style={styles.stack}>
          <Reveal order={0}>
            <GlanceCard stats={stats} monthName={monthName} />
          </Reveal>

          <Reveal order={1}>
            <GlassCard>
              <CardTitle icon="Waves" title={t('insights.patternsTitle')} />
              <AppText style={styles.body}>{summary}</AppText>
              <View style={styles.chips}>
                {themes.map((theme) => {
                  const label = theme.label[language] ?? theme.label.en;
                  return (
                    <Chip
                      key={theme.label.en}
                      background={withAlpha(colors.lavenderSoft, 0.9)}
                      color={colors.plum}
                      label={t('insights.themeChip', { label, count: theme.count })}
                      accessibilityLabel={t('insights.themeA11y', { label, count: theme.count })}
                    />
                  );
                })}
              </View>
            </GlassCard>
          </Reveal>

          <Reveal order={2}>
            <GlassCard>
              <CardTitle icon="CalendarDays" title={t('insights.weeklyTitle')} subtitle={t('insights.weeklySubtitle')} />
              <WeeklyBars weeks={stats.weeks} language={language} />
            </GlassCard>
          </Reveal>

          <Reveal order={3}>
            <GlassCard>
              <CardTitle icon="Gem" title={t('insights.symbolsTitle')} subtitle={t('insights.symbolsSubtitle')} />
              <View style={styles.chips}>
                {symbols.map((symbol) => (
                  <Chip key={symbol} background={withAlpha(colors.roseSoft, 0.9)} color={colors.roseDeep} label={symbol} />
                ))}
              </View>
            </GlassCard>
          </Reveal>

          <Reveal order={4}>
            <GlassCard>
              <CardTitle icon="Compass" title={t('insights.journeyTitle')} />
              <AppText style={styles.journey}>{journey}</AppText>
            </GlassCard>
          </Reveal>

          <Reveal order={5}>
            <GlassCard>
              <View style={styles.premiumRow}>
                <IconCircle name="Sparkles" size={44} tint={withAlpha(colors.goldLight, 0.32)} color={colors.gold} />
                <View style={styles.premiumText}>
                  <AppText style={styles.premiumTitle}>{t('insights.premiumTitle')}</AppText>
                  <AppText style={styles.body}>{t('insights.premiumNote')}</AppText>
                </View>
              </View>
              <View style={styles.included} accessible accessibilityLabel={t('insights.premiumCta')}>
                <View>
                  <Icon name="Check" size={16} color={colors.goldDeep} strokeWidth={2.2} />
                </View>
                <AppText style={styles.includedText}>{t('insights.premiumCta')}</AppText>
              </View>
            </GlassCard>
          </Reveal>
        </View>
      </ScrollView>
    </SkyPage>
  );
}

function Reveal({ order, children, style }: { order: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInUp.duration(460).delay(60 + order * 80)} style={style}>
      {children}
    </Animated.View>
  );
}

function GlassCard({ children }: { children: ReactNode }) {
  return <View style={[glass.card, glassBlur, styles.card]}>{children}</View>;
}

function CardTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.cardTitle}>
      <IconCircle name={icon} size={36} tint={withAlpha(colors.goldLight, 0.3)} color={colors.gold} />
      <View style={styles.cardTitleText}>
        <AppText style={styles.cardHeading} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'center' },
  stack: { gap: spacing.lg, marginTop: spacing.xxl },
  card: { padding: spacing.xl, gap: spacing.lg },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitleText: { flex: 1 },
  cardHeading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.plumDeep },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  journey: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 29, color: colors.plumDeep },
  premiumRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  premiumText: { flex: 1, gap: spacing.xs },
  premiumTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.plumDeep },
  included: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.gold, 0.55),
    backgroundColor: withAlpha(colors.goldLight, 0.18),
  },
  includedText: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 20, color: colors.goldDeep },
});
