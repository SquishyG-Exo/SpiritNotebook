import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs } from 'expo-router';
import { Fragment } from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, gradients, shadow, spacing, withAlpha } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './icons';
import { PressableScale } from './PressableScale';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Route name → icon. Labels come from the Tabs.Screen `title` option (translated in the layout). */
const TAB_ICONS: Record<string, IconName> = {
  index: 'House',
  notebook: 'BookOpen',
  calendar: 'CalendarDays',
  favorites: 'Heart',
};

/** The centre "+" sits after this many tabs. */
const CENTER_AFTER = 2;

/**
 * The bar's rounded top corners overlap the bottom of the screen above by
 * this much, so the screen's own background (the sky on Home) shows around
 * them. Tab screens keep at least this much bottom padding (Screen's default
 * bottomSpace already does).
 */
export const TAB_BAR_OVERLAP = 22;
/** Diameter of the raised gold "+" and how far it rises above the bar's top edge. */
export const TAB_FAB_SIZE = 58;
export const TAB_FAB_RISE = 22;
/** Bottom padding a tab screen needs for its last row to clear the bar and the raised "+". */
export const TAB_SCENE_CLEARANCE = TAB_BAR_OVERLAP + TAB_FAB_RISE + spacing.sm;

const ROW_TOP = spacing.sm;
const ITEM_HEIGHT = 52;
/** The bar's full height for a given bottom safe-area inset (layout.tabBarHeight without an inset). */
export const tabBarHeightFor = (bottomInset: number) => ROW_TOP + ITEM_HEIGHT + Math.max(bottomInset, spacing.sm);

const ACTIVE = colors.goldLight;
/** Soft white: about 6:1 on the bar, a step quieter than the gold active tab. */
const INACTIVE = withAlpha(colors.cream, 0.66);

/**
 * Design 4 bottom bar: dark plum with rounded top corners, four labelled tabs
 * (gold when active) and a raised gold "+" in the centre that opens /explore.
 */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <View style={[styles.bar, { height: tabBarHeightFor(insets.bottom) }]}>
        <LinearGradient colors={gradients.nav} style={StyleSheet.absoluteFill} />
        <View style={styles.sheen} />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const label = typeof options.title === 'string' ? options.title : route.name;
            const color = focused ? ACTIVE : INACTIVE;

            return (
              <Fragment key={route.key}>
                {index === CENTER_AFTER ? <View style={styles.fabSlot} /> : null}
                <PressableScale
                  scaleTo={0.92}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={label}
                  testID={options.tabBarButtonTestID}
                  onPress={() => {
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                  }}
                  onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                  style={styles.item}>
                  <Icon
                    name={TAB_ICONS[route.name] ?? 'Sparkle'}
                    size={23}
                    color={color}
                    strokeWidth={focused ? 1.9 : 1.6}
                    fill={focused ? withAlpha(ACTIVE, 0.22) : 'none'}
                  />
                  <AppText
                    variant="caption"
                    color={color}
                    numberOfLines={1}
                    style={[styles.label, focused ? styles.labelActive : null]}>
                    {label}
                  </AppText>
                </PressableScale>
              </Fragment>
            );
          })}
        </View>
      </View>

      <PressableScale
        scaleTo={0.9}
        accessibilityRole="button"
        accessibilityLabel={t('common.tabs.new')}
        testID="tab-new-entry"
        onPress={() => router.push('/explore')}
        style={styles.fab}>
        {/* Light top-left shine; the middle and lower half stay deep gold so the white "+" keeps 3:1. */}
        <LinearGradient
          colors={gradients.gold}
          locations={[0, 0.5]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* A View (positioned on web) keeps the glyph above the absolutely positioned gradient. */}
        <View>
          <Icon name="Plus" size={30} color={colors.white} strokeWidth={2.4} />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: -TAB_BAR_OVERLAP,
  },
  bar: {
    borderTopLeftRadius: TAB_BAR_OVERLAP,
    borderTopRightRadius: TAB_BAR_OVERLAP,
    overflow: 'hidden',
    backgroundColor: colors.navDark,
  },
  /** Hairline of warm light along the top edge. */
  sheen: {
    position: 'absolute',
    top: 0,
    left: TAB_BAR_OVERLAP,
    right: TAB_BAR_OVERLAP,
    height: 1,
    backgroundColor: withAlpha(colors.goldLight, 0.22),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: ROW_TOP,
    paddingHorizontal: spacing.xs,
  },
  item: {
    flex: 1,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0.1,
  },
  labelActive: {
    fontFamily: fonts.bodySemiBold,
  },
  fabSlot: {
    width: TAB_FAB_SIZE + spacing.lg,
  },
  fab: {
    position: 'absolute',
    top: -TAB_FAB_RISE,
    left: '50%',
    marginLeft: -TAB_FAB_SIZE / 2,
    width: TAB_FAB_SIZE,
    height: TAB_FAB_SIZE,
    borderRadius: TAB_FAB_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: withAlpha(colors.goldLight, 0.9),
    ...shadow.goldGlow,
  },
});
