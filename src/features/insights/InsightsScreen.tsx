import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { insights } from '../../../brand/insights';
import { localeFor } from '../../lib/dates';
import { useJournal, useSettings } from '../../state';
import { colors, fonts, spacing } from '../../theme';
import { AppText, Button, Card, Chip, Icon, IconCircle, Screen } from '../../ui';
import { GlanceCard } from './GlanceCard';
import { computeInsightStats } from './insightsModel';
import { WeeklyBars } from './WeeklyBars';

/** Premium Insights preview: computed counts from the journal plus mocked patterns from brand/insights.ts. */
export function InsightsScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { savedEntries } = useJournal();
  const [now] = useState(() => new Date());
  const stats = useMemo(() => computeInsightStats(savedEntries, now), [savedEntries, now]);
  const monthName = new Intl.DateTimeFormat(localeFor(language), { month: 'long' }).format(now);

  const themes = insights.themes;
  const symbols = insights.symbols[language] ?? insights.symbols.en;
  const summary = insights.summary[language] ?? insights.summary.en;
  const journey = insights.journey[language] ?? insights.journey.en;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppText variant="title" accessibilityRole="header">
            {t('insights.title')}
          </AppText>
          <Chip
            label={t('common.premium')}
            tone="premium"
            icon={<Icon name="Sparkles" size={13} color={colors.gold} strokeWidth={2} />}
          />
        </View>
        <AppText variant="small" color={colors.muted}>
          {t('insights.subtitle')}
        </AppText>
      </View>

      <View style={styles.stack}>
        <Reveal order={0}>
          <GlanceCard stats={stats} monthName={monthName} />
        </Reveal>

        <Reveal order={1}>
          <Card style={styles.card}>
            <CardTitle icon="Waves" title={t('insights.patternsTitle')} />
            <AppText variant="body" color={colors.inkSoft}>
              {summary}
            </AppText>
            <View style={styles.chips}>
              {themes.map((theme) => {
                const label = theme.label[language] ?? theme.label.en;
                return (
                  <Chip
                    key={theme.label.en}
                    tone="lavender"
                    label={t('insights.themeChip', { label, count: theme.count })}
                    accessibilityLabel={t('insights.themeA11y', { label, count: theme.count })}
                  />
                );
              })}
            </View>
          </Card>
        </Reveal>

        <Reveal order={2}>
          <Card style={styles.card}>
            <CardTitle
              icon="CalendarDays"
              title={t('insights.weeklyTitle')}
              subtitle={t('insights.weeklySubtitle')}
            />
            <WeeklyBars weeks={stats.weeks} language={language} />
          </Card>
        </Reveal>

        <Reveal order={3}>
          <Card style={styles.card}>
            <CardTitle icon="Gem" title={t('insights.symbolsTitle')} subtitle={t('insights.symbolsSubtitle')} />
            <View style={styles.chips}>
              {symbols.map((symbol) => (
                <Chip key={symbol} tone="rose" label={symbol} />
              ))}
            </View>
          </Card>
        </Reveal>

        <Reveal order={4}>
          <Card style={styles.card}>
            <CardTitle icon="Compass" title={t('insights.journeyTitle')} />
            <View style={styles.quote}>
              <AppText style={styles.quoteMark} color={colors.rose} accessibilityElementsHidden importantForAccessibility="no">
                “
              </AppText>
              <AppText variant="quote" color={colors.ink} style={styles.quoteText}>
                {journey}
              </AppText>
            </View>
          </Card>
        </Reveal>

        <Reveal order={5}>
          <Card tint={colors.surfaceTint} elevated={false} style={styles.card}>
            <View style={styles.premiumRow}>
              <IconCircle name="Sparkles" size={44} tint={colors.peachSoft} color={colors.gold} />
              <View style={styles.premiumText}>
                <AppText variant="subheading">{t('insights.premiumTitle')}</AppText>
                <AppText variant="small" color={colors.inkSoft}>
                  {t('insights.premiumNote')}
                </AppText>
              </View>
            </View>
            <Button
              label={t('insights.premiumCta')}
              variant="secondary"
              size="md"
              disabled
              icon={<Icon name="Check" size={18} color={colors.roseDeep} strokeWidth={2} />}
            />
          </Card>
        </Reveal>
      </View>
    </Screen>
  );
}

function Reveal({ order, children }: { order: number; children: ReactNode }) {
  return <Animated.View entering={FadeInUp.duration(460).delay(60 + order * 80)}>{children}</Animated.View>;
}

function CardTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.cardTitle}>
      <IconCircle name={icon} size={34} tint={colors.lavenderSoft} color={colors.lavenderDeep} />
      <View style={styles.cardTitleText}>
        <AppText variant="heading" accessibilityRole="header" style={styles.cardHeading}>
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
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  stack: { gap: spacing.lg },
  card: { gap: spacing.lg },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitleText: { flex: 1 },
  cardHeading: { fontSize: 19, lineHeight: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quote: { paddingLeft: spacing.xs },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 40,
    height: 26,
    marginBottom: spacing.xs,
  },
  quoteText: { fontSize: 17, lineHeight: 26 },
  premiumRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  premiumText: { flex: 1, gap: spacing.xs },
});
