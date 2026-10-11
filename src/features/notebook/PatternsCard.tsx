import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, gradients, spacing } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { glass, glassBlur } from './glass';
import { PremiumChip } from './PremiumChip';

const BADGE = 48;

/** "Your patterns · Premium": the Notebook's door to Insights. */
export function PatternsCard() {
  const { t } = useTranslation();
  const title = t('notebook.patterns.title');
  const subtitle = t('notebook.patterns.subtitle');
  return (
    <PressableScale
      onPress={() => router.push('/insights')}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t('common.premium')}. ${subtitle}`}
      testID="notebook-patterns"
      style={[glass.card, glassBlur, styles.card]}>
      <View style={styles.badge}>
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Wrapped: a bare web <svg> would paint under the absolutely positioned gradient. */}
        <View>
          <Icon name="Sparkles" size={22} color={colors.white} strokeWidth={1.8} />
        </View>
      </View>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <AppText style={styles.title}>{title}</AppText>
          <PremiumChip />
        </View>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
      <View>
        <Icon name="ChevronRight" size={20} color={colors.muted} strokeWidth={1.75} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingLeft: spacing.md + 2,
    paddingRight: spacing.sm + 2,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: 2 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.plumDeep, fontVariant: ['lining-nums'] },
  subtitle: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.inkSoft },
});
