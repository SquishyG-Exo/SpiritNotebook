import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { categories, type CategoryDef } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText, Icon, Screen } from '../../ui';
import { Butterfly, EnergyField } from '../../ui/art';
import { categoryLabel } from '../../lib/categoryCopy';
import { CategoryTile } from './CategoryTile';
import { pageStyle } from './pageStyle';
import { ScreenBanner } from './ScreenBanner';

function openCategory(def: CategoryDef) {
  if (def.hasSubcategories) router.push(`/explore/${def.key}`);
  else router.push({ pathname: '/entry/new', params: { category: def.key } });
}

/** Below this tile width the 13px label can no longer fit "Synchronicities" / "Sincronicidades". */
const COMPACT_TILE = 106;
const COLUMNS = 3;
/** A faint, static glow behind the middle of the grid; only its edges show between the tiles. */
const GLOW = 360;

export function ExploreScreen() {
  const { t } = useTranslation();
  const [gridWidth, setGridWidth] = useState(0);
  const tileWidth = (gridWidth - (COLUMNS - 1) * spacing.md) / COLUMNS;
  const compact = gridWidth > 0 && tileWidth < COMPACT_TILE;

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={pageStyle.content}>
      <ScreenBanner height={140} />

      <Animated.View entering={FadeInUp.duration(500)} style={styles.intro}>
        <AppText variant="title">{t('explore.title')}</AppText>
        <AppText variant="body" color={colors.muted}>
          {t('explore.subtitle')}
        </AppText>
      </Animated.View>

      <View style={styles.gridArea}>
        <EnergyField size={GLOW} color={colors.lavender} intensity={0.22} animated={false} style={styles.glow} />
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
        {/* Just past the grid's bottom-right corner, right of anything the footer can wrap to. */}
        <View style={styles.corner}>
          <Butterfly size={26} rotation={-20} opacity={0.5} delay={1200} colorA={colors.lavender} colorB={colors.rose} />
        </View>
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
  },
  gridArea: {
    marginTop: spacing.xxl,
  },
  glow: {
    top: '50%',
    left: '50%',
    marginTop: -GLOW / 2,
    marginLeft: -GLOW / 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  corner: {
    position: 'absolute',
    right: -8,
    bottom: -48,
    pointerEvents: 'none',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
