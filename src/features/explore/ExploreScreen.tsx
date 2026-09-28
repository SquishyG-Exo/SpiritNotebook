import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { categories, type CategoryDef } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText, Header, Icon, Screen } from '../../ui';
import { categoryLabel } from './categoryCopy';
import { CategoryTile } from './CategoryTile';
import { pageStyle } from './pageStyle';

function openCategory(def: CategoryDef) {
  if (def.hasSubcategories) router.push(`/explore/${def.key}`);
  else router.push({ pathname: '/entry/new', params: { category: def.key } });
}

/** Below this tile width the 13px label can no longer fit "Synchronicities" / "Sincronicidades". */
const COMPACT_TILE = 106;
const COLUMNS = 3;

export function ExploreScreen() {
  const { t } = useTranslation();
  const [gridWidth, setGridWidth] = useState(0);
  const tileWidth = (gridWidth - (COLUMNS - 1) * spacing.md) / COLUMNS;
  const compact = gridWidth > 0 && tileWidth < COMPACT_TILE;

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={pageStyle.content}>
      <Header backLabel={t('common.actions.back')} />

      <Animated.View entering={FadeInUp.duration(500)} style={styles.intro}>
        <AppText variant="title">{t('explore.title')}</AppText>
        <AppText variant="body" color={colors.muted}>
          {t('explore.subtitle')}
        </AppText>
      </Animated.View>

      <View style={styles.grid} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {categories.map((def, index) => (
          <CategoryTile
            key={def.key}
            def={def}
            index={index}
            compact={compact}
            label={categoryLabel(t, def.key)}
            onPress={() => openCategory(def)}
          />
        ))}
      </View>

      <Animated.View entering={FadeIn.delay(760).duration(600)} style={styles.footer}>
        <Icon name="Sparkle" size={14} color={colors.rose} />
        <AppText variant="small" color={colors.muted} align="center">
          {t('explore.footer')}
        </AppText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
