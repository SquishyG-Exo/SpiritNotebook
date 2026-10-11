import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { categoryByKey, lifeSituations } from '../../../brand/categories';
import { categoryLabel, situationLabel } from '../../lib/categoryCopy';
import { colors, spacing } from '../../theme';
import { AppText, glass, glassBlur, HitSlopArea, Icon, IconCircle } from '../../ui';
import type { ComposerTopic } from './params';

export interface TopicRowProps extends ComposerTopic {
  /** 'YYYY-MM-DD' to carry back to the chooser when the reader picked another day. */
  date?: string;
}

/** The chosen category (and life situation) on a glass pill, with a way to change it. */
export function TopicRow({ category, subcategory, date }: TopicRowProps) {
  const { t } = useTranslation();
  const def = categoryByKey(category);
  const situation = subcategory ? lifeSituations.find((s) => s.key === subcategory) : undefined;

  // Back to the "+" chooser, keeping the chosen day; replaces the composer when the chooser is not in the stack.
  const change = () => router.dismissTo(date ? { pathname: '/explore', params: { date } } : '/explore');

  return (
    <View style={[glass.pill, glassBlur, styles.row]}>
      <IconCircle name={situation?.icon ?? def.icon} size={38} tint={colors.white} color={colors.gold} strokeWidth={1.6} />
      <View style={styles.text}>
        {situation ? (
          <>
            <AppText variant="overline" color={colors.goldDeep} numberOfLines={1}>
              {categoryLabel(t, category)}
            </AppText>
            <AppText variant="smallMedium" numberOfLines={1}>
              {situationLabel(t, situation.key)}
            </AppText>
          </>
        ) : (
          <AppText variant="subheading" numberOfLines={1}>
            {categoryLabel(t, category)}
          </AppText>
        )}
      </View>

      <Pressable
        onPress={change}
        accessibilityRole="button"
        accessibilityLabel={t('entry.changeHint')}
        hitSlop={10}
        testID="entry-change-topic"
        style={({ pressed }) => [styles.change, pressed ? styles.pressed : null]}>
        <HitSlopArea hitSlop={10} />
        <AppText variant="smallMedium" color={colors.plum}>
          {t('entry.change')}
        </AppText>
        <Icon name="ChevronRight" size={16} color={colors.plum} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm - 2,
    paddingLeft: spacing.sm - 2,
    paddingRight: spacing.lg,
  },
  text: {
    flex: 1,
    minWidth: 0,
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
