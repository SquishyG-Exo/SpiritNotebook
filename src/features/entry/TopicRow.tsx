import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { categoryByKey, lifeSituations } from '../../../brand/categories';
import { colors, radius, spacing } from '../../theme';
import { AppText, Icon, IconCircle } from '../../ui';
import { categoryLabel, situationColors, situationLabel } from '../explore/categoryCopy';
import { withAlpha } from '../home/withAlpha';
import type { ComposerTopic } from './params';

/** The chosen category (and life situation) as a soft chip, with a way to change it. */
export function TopicRow({ category, subcategory }: ComposerTopic) {
  const { t } = useTranslation();
  const def = categoryByKey(category);
  const situation = subcategory ? lifeSituations.find((s) => s.key === subcategory) : undefined;
  const palette = situation ? situationColors(situation.key) : def;

  return (
    <View style={styles.row}>
      <View style={[styles.chip, { backgroundColor: palette.tint }]}>
        <IconCircle
          name={situation?.icon ?? def.icon}
          size={36}
          tint={withAlpha(colors.white, 0.7)}
          color={palette.accent}
        />
        <View style={styles.chipText}>
          {situation ? (
            <>
              <AppText variant="overline" color={palette.accent} numberOfLines={1}>
                {categoryLabel(t, category)}
              </AppText>
              <AppText variant="smallMedium" numberOfLines={1}>
                {situationLabel(t, situation.key)}
              </AppText>
            </>
          ) : (
            <AppText variant="bodyMedium" numberOfLines={1}>
              {categoryLabel(t, category)}
            </AppText>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => router.dismissTo('/explore')}
        accessibilityRole="button"
        accessibilityLabel={t('entry.changeHint')}
        hitSlop={10}
        style={({ pressed }) => [styles.change, pressed ? styles.pressed : null]}>
        <AppText variant="smallMedium" color={colors.roseDeep}>
          {t('entry.change')}
        </AppText>
        <Icon name="ChevronRight" size={16} color={colors.roseDeep} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  chipText: {
    flexShrink: 1,
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
});
