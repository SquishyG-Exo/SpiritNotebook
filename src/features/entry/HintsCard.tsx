import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import type { CategoryKey } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText, Card, Icon } from '../../ui';
import { categoryBullets } from '../../lib/categoryCopy';

function genericHints(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export interface HintsCardProps {
  category: CategoryKey;
  tint: string;
  accent: string;
}

/** Soft tinted card with the category's three short bullets. */
export function HintsCard({ category, tint, accent }: HintsCardProps) {
  const { t } = useTranslation();
  const bullets = categoryBullets(t, category);
  const hints = bullets.length > 0 ? bullets : genericHints(t('entry.genericHints', { returnObjects: true }));
  if (hints.length === 0) return null;

  return (
    <Card tint={tint} elevated={false} padding={spacing.lg} style={{ borderColor: tint }}>
      <AppText variant="overline" color={accent}>
        {t('entry.hintsTitle')}
      </AppText>
      <View style={styles.list}>
        {hints.slice(0, 3).map((hint) => (
          <View key={hint} style={styles.item}>
            <View style={styles.bullet}>
              <Icon name="Sparkle" size={13} color={accent} strokeWidth={2} />
            </View>
            <AppText variant="small" color={colors.inkSoft} style={styles.text}>
              {hint}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
