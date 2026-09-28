import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { categoryByKey } from '../../../brand/categories';
import { colors, fonts, gradients, radius, shadow, spacing , withAlpha } from '../../theme';
import { AppText, Icon, IconCircle } from '../../ui';
import { categoryLabel } from '../../lib/categoryCopy';
import { type InsightStats } from './insightsModel';

const GLASS = withAlpha(colors.white, 0.62);
const GLASS_EDGE = withAlpha(colors.white, 0.75);

/** "This month at a glance": three stat tiles on the premium gradient. */
export function GlanceCard({ stats, monthName }: { stats: InsightStats; monthName: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradients.premium}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heading}>
        <Icon name="Sparkles" size={16} color={colors.ink} strokeWidth={2} />
        <AppText variant="overline" color={colors.ink} accessibilityRole="header">
          {t('insights.glanceTitle')}
        </AppText>
      </View>

      <View style={styles.row}>
        <StatTile
          label={t('insights.entriesThisMonth')}
          value={stats.monthCount}
          hint={t('insights.entriesThisMonthHint', { month: monthName })}
        />
        <StatTile label={t('insights.daysNoted')} value={stats.daysNoted} hint={t('insights.daysNotedHint')} />
      </View>

      <TopCategoryTile stats={stats} />
    </View>
  );
}

/**
 * The month's most used category. When nothing repeats yet (every category used
 * once), say so instead of crowning an arbitrary tie-winner.
 */
function TopCategoryTile({ stats }: { stats: InsightStats }) {
  const { t } = useTranslation();
  const top = stats.topCategory;
  const varied = !!top && top.count === 1 && stats.categoryCount > 1;
  const def = top && !varied ? categoryByKey(top.key) : undefined;

  let value: string | undefined;
  let detail: string;
  if (!top) detail = t('insights.topCategoryEmpty');
  else if (varied) {
    value = t('insights.topCategoryVaried');
    detail = t('insights.categoryCount', { count: stats.categoryCount });
  } else {
    value = categoryLabel(t, top.key);
    detail = t('insights.topCategoryCount', { count: top.count });
  }

  return (
    <View
      style={[styles.tile, styles.wideTile]}
      accessible
      accessibilityLabel={[t('insights.topCategory'), value, detail].filter(Boolean).join(', ')}>
      {def ? (
        <IconCircle name={def.icon} size={46} tint={def.tint} color={def.accent} />
      ) : (
        <IconCircle
          name={varied ? 'Compass' : 'Sparkle'}
          size={46}
          tint={colors.white}
          color={varied ? colors.lavenderDeep : colors.faint}
        />
      )}
      <View style={styles.wideText}>
        <AppText variant="caption" color={colors.inkSoft}>
          {t('insights.topCategory')}
        </AppText>
        {value ? (
          <AppText style={styles.categoryValue} numberOfLines={1}>
            {value}
          </AppText>
        ) : null}
        <AppText variant={value ? 'caption' : 'small'} color={colors.inkSoft}>
          {detail}
        </AppText>
      </View>
    </View>
  );
}

/** Stat tile contract: label (sentence case) · value (sans, proportional figures) · optional hint. */
function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <View style={[styles.tile, styles.statTile]} accessible accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ''}`}>
      <AppText variant="caption" color={colors.inkSoft}>
        {label}
      </AppText>
      <AppText style={styles.value}>{value.toLocaleString()}</AppText>
      {hint ? (
        <AppText variant="caption" color={colors.inkSoft} style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.soft,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  tile: {
    backgroundColor: GLASS,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: GLASS_EDGE,
    padding: spacing.md,
  },
  statTile: { flex: 1, minHeight: 104 },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  hint: { marginTop: 'auto' },
  wideTile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  wideText: { flex: 1, gap: 2 },
  categoryValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 19,
    lineHeight: 24,
    color: colors.ink,
  },
});
