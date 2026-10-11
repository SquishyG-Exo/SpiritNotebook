import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import type { CategoryKey } from '../../../brand/categories';
import { categoryBullets } from '../../lib/categoryCopy';
import { colors, spacing } from '../../theme';
import { AppText, Icon } from '../../ui';
import { glass, glassBlur } from './scenery';

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/** Frosted card with the category's three short hints, gold sparkles for bullets. */
export function HintsCard({ category }: { category: CategoryKey }) {
  const { t } = useTranslation();
  const bullets = categoryBullets(t, category);
  const hints = bullets.length > 0 ? bullets : asList(t('entry.genericHints', { returnObjects: true }));
  if (hints.length === 0) return null;

  return (
    <View style={[glass.card, glassBlur, styles.card]}>
      <AppText variant="overline" color={colors.goldDeep}>
        {t('entry.hintsTitle')}
      </AppText>
      <View style={styles.list}>
        {hints.slice(0, 3).map((hint) => (
          <View key={hint} style={styles.item}>
            <View style={styles.bullet}>
              <Icon name="Sparkle" size={13} color={colors.gold} strokeWidth={2} />
            </View>
            <AppText variant="small" color={colors.inkSoft} style={styles.text}>
              {hint}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  list: {
    marginTop: spacing.sm + 2,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
  },
  bullet: {
    height: 20,
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
