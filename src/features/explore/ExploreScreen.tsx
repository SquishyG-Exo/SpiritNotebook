import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mainCategories, type CategoryKey } from '../../../brand/categories';
import { categoryLabel, categorySubtitle } from '../../lib/categoryCopy';
import { colors, fonts, layout, spacing } from '../../theme';
import { AppText, GlassIconButton, goBackOrHome, Icon } from '../../ui';
import { SkyBackdrop } from '../../ui/art';
import { HomeTile, TileGrid } from '../home/HomeTile';
import { MoreTiles } from '../home/MoreTiles';
import { DateChip } from './DateChip';
import { dateParam, withDate } from './params';

function openCategory(category: CategoryKey, date: string | undefined) {
  if (category === 'life') router.push({ pathname: '/explore/life', params: withDate(date) });
  else router.push({ pathname: '/entry/new', params: { category, ...withDate(date) } });
}

/**
 * The centre "+": choose what to record. /explore?date=YYYY-MM-DD (from the
 * calendar) carries the day through to the composer.
 */
export function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const date = dateParam(params.date);

  return (
    <View style={styles.root}>
      <SkyBackdrop scene="dusk" />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <GlassIconButton
            icon="ChevronLeft"
            label={t('common.actions.back')}
            onPress={goBackOrHome}
            iconOffset={-2}
            testID="explore-back"
          />
        </View>

        <Animated.View entering={FadeInUp.duration(500)} style={styles.intro}>
          <AppText variant="title" color={colors.plum} align="center" accessibilityRole="header" style={styles.title}>
            {t('explore.title')}
          </AppText>
          <AppText align="center" style={styles.subtitle}>
            {t('explore.subtitle')}
          </AppText>
          {date ? <DateChip date={date} /> : null}
        </Animated.View>

        <TileGrid style={styles.grid}>
          {mainCategories.map((def, index) => (
            <HomeTile
              key={def.key}
              order={index}
              icon={def.icon}
              numerals={def.key === 'numbers' ? '11:11' : undefined}
              label={categoryLabel(t, def.key)}
              subtitle={categorySubtitle(t, def.key)}
              onPress={() => openCategory(def.key, date)}
              testID={`category-${def.key}`}
            />
          ))}
        </TileGrid>

        <MoreTiles
          title={t('explore.more')}
          onOpen={(key) => openCategory(key, date)}
          order={mainCategories.length}
          testIDPrefix="category"
        />

        <Animated.View entering={FadeIn.delay(700).duration(600)} style={styles.footer}>
          <Icon name="Sparkle" size={14} color={colors.gold} />
          <AppText variant="small" color={colors.inkSoft} align="center">
            {t('explore.footer')}
          </AppText>
        </Animated.View>
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
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  intro: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  // Narrow enough to break evenly ("What would you like / to record?").
  title: {
    alignSelf: 'center',
    maxWidth: 255,
  },
  subtitle: {
    fontFamily: fonts.displayRegular,
    fontSize: 18,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  grid: {
    marginTop: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
