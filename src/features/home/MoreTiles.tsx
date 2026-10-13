import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { moreCategories, type CategoryDef, type CategoryKey } from '../../../brand/categories';
import { categoryLabel, categorySubtitle } from '../../lib/categoryCopy';
import { colors, fonts, spacing, withAlpha } from '../../theme';
import { AppText } from '../../ui';
import { HomeTile, TileGrid } from './HomeTile';

export interface MoreTilesProps {
  title: string;
  onOpen: (category: CategoryKey) => void;
  /** Where the staggered entrance continues from (the number of tiles above). */
  order: number;
  testIDPrefix: string;
}

function pairsOf(list: readonly CategoryDef[]): CategoryDef[][] {
  const pairs: CategoryDef[][] = [];
  for (let i = 0; i < list.length; i += 2) pairs.push(list.slice(i, i + 2));
  return pairs;
}

/**
 * The original brief's categories, listed under the client's own buttons: a
 * quiet serif heading between two gold rules, then the tiles in centred pairs.
 */
export function MoreTiles({ title, onOpen, order, testIDPrefix }: MoreTilesProps) {
  const { t } = useTranslation();
  const pairs = pairsOf(moreCategories);
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.rule} />
        <AppText style={styles.title} accessibilityRole="header">
          {title}
        </AppText>
        <View style={styles.rule} />
      </View>
      {pairs.map((pair, row) => (
        <TileGrid key={pair.map((def) => def.key).join('-')} style={row < pairs.length - 1 ? styles.rowGap : null}>
          {pair.map((def, index) => (
            <HomeTile
              key={def.key}
              order={order + row * 2 + index}
              icon={def.icon}
              label={categoryLabel(t, def.key)}
              subtitle={categorySubtitle(t, def.key)}
              onPress={() => onOpen(def.key)}
              testID={`${testIDPrefix}-${def.key}`}
            />
          ))}
        </TileGrid>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxl,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: withAlpha(colors.gold, 0.45),
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.plum,
  },
  // TileGrid pulls its last row's gap back in; between the pairs it is kept.
  rowGap: {
    marginBottom: 0,
  },
});
