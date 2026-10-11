import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { categoryByKey, featureByKey, homeTiles, type HomeTileDef } from '../../../brand/categories';
import { tileCopy } from '../../lib/categoryCopy';
import { colors, fonts, layout, spacing, withAlpha } from '../../theme';
import { AppText } from '../../ui';
import { LotusMark, Monogram, SkyBackdrop } from '../../ui/art';
import { TAB_BAR_OVERLAP, TAB_SCENE_CLEARANCE, tabBarHeightFor } from '../../ui/TabBar';
import { GlassIconButton } from './GlassIconButton';
import { HomeTile, TILE_GAP, TILE_MIN_HEIGHT, TileGrid } from './HomeTile';

const LOTUS_MIN = 96;
const LOTUS_MAX = 116;
/** Title line plus the two-line tagline (see styles.title / styles.tagline). */
const HERO_TEXT_HEIGHT = 54 + 1 + 2 * 21;
const GRID_HEIGHT = 4 * TILE_MIN_HEIGHT + 3 * TILE_GAP;

/** The app's viewport: the window, or the desktop phone frame on wide web windows (src/global.css). */
function useViewport(): { width: number; height: number } {
  const { width, height } = useWindowDimensions();
  if (Platform.OS === 'web' && width >= 768 && height >= 640) return { width: 390, height: Math.min(844, height - 72) };
  return { width, height };
}

/**
 * The lotus takes whatever height is left once the text, the grid and the tab
 * bar are placed, so the whole composition fits above the bar on a 390×844
 * phone. Shorter screens keep a 96 px flower and scroll the last row into view.
 */
function lotusHeightFor(viewportHeight: number, insets: EdgeInsets): number {
  const scene = viewportHeight - (tabBarHeightFor(insets.bottom) - TAB_BAR_OVERLAP);
  const rest = insets.top + spacing.sm + HERO_TEXT_HEIGHT + spacing.md + GRID_HEIGHT + TAB_SCENE_CLEARANCE;
  return Math.round(Math.min(LOTUS_MAX, Math.max(LOTUS_MIN, scene - rest)));
}

/** Background monogram: faint, to the right, partly off the edge (after the client's reference). */
const MONOGRAM_SIZE = 230;
const TOP_WASH = [withAlpha(colors.lavenderDeep, 0.2), withAlpha(colors.lavenderDeep, 0)] as const;

function openHomeTile(tile: HomeTileDef) {
  if (tile.kind === 'feature') router.push(featureByKey(tile.key).href);
  else if (tile.key === 'life') router.push('/explore/life');
  else router.push({ pathname: '/entry/new', params: { category: tile.key } });
}

const openProfile = () => router.push('/profile');

/** Design 4 Home: sky, lotus, serif title and tagline over a 3 × 4 grid of glass tiles. */
export function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const viewport = useViewport();
  const lotusHeight = lotusHeightFor(viewport.height, insets);
  const top = insets.top + spacing.sm;
  // Below 350 px the 50 px title would wrap; a smaller one keeps it on one line.
  const narrow = viewport.width < 350;

  return (
    <View style={styles.root}>
      <SkyBackdrop scene="home">
        {/* A violet wash over the upper sky, as on Design 4; it fades out above the title. */}
        <LinearGradient colors={TOP_WASH} locations={[0, 1]} style={styles.wash} />
        <Monogram size={MONOGRAM_SIZE} opacity={0.11} style={[styles.monogram, { top: top + lotusHeight * 0.25 }]} />
      </SkyBackdrop>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingTop: top, paddingBottom: TAB_SCENE_CLEARANCE }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Animated.View entering={FadeIn.duration(900)}>
            <LotusMark height={lotusHeight} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(80).duration(600)}>
            <AppText
              variant="hero"
              color={colors.plum}
              align="center"
              accessibilityRole="header"
              style={[styles.title, narrow ? styles.titleNarrow : null]}>
              {t('common.app.name')}
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(160).duration(600)}>
            <AppText align="center" style={styles.tagline}>
              {t('common.app.tagline')}
            </AppText>
          </Animated.View>

          {/* Gear and profile flank the lotus, as on Design 4; both open Profile. */}
          <View style={styles.topBar}>
            <GlassIconButton icon="Settings" label={t('home.settings')} onPress={openProfile} testID="home-settings" />
            <GlassIconButton
              icon="CircleUserRound"
              label={t('home.profile')}
              onPress={openProfile}
              testID="home-profile"
            />
          </View>
        </View>

        <TileGrid style={styles.grid}>
          {homeTiles.map((tile, index) => {
            const { label, subtitle } = tileCopy(t, tile);
            const icon = tile.kind === 'feature' ? featureByKey(tile.key).icon : categoryByKey(tile.key).icon;
            return (
              <HomeTile
                key={`${tile.kind}-${tile.key}`}
                order={index}
                icon={icon}
                numerals={tile.kind === 'category' && tile.key === 'numbers' ? '11:11' : undefined}
                label={label}
                subtitle={subtitle}
                onPress={() => openHomeTile(tile)}
                testID={`home-tile-${tile.key}`}
              />
            );
          })}
        </TileGrid>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: 14,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  monogram: {
    position: 'absolute',
    right: -MONOGRAM_SIZE * 0.3,
  },
  hero: {
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 50,
    // Room for the descender of "p" above the tagline.
    lineHeight: 54,
  },
  titleNarrow: {
    fontSize: 42,
    lineHeight: 47,
  },
  tagline: {
    marginTop: 1,
    // Breaks after "the path", as on Design 4.
    maxWidth: 262,
    fontFamily: fonts.displayRegular,
    fontSize: 17.5,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  grid: {
    marginTop: spacing.md,
  },
});
