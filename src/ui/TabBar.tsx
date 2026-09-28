import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, layout, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './icons';
import { PressableScale } from './PressableScale';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Route name → icon. Labels come from the Tabs.Screen `title` option (translated in the layout). */
const TAB_ICONS: Record<string, IconName> = {
  index: 'House',
  calendar: 'CalendarDays',
  insights: 'Sparkles',
  profile: 'UserRound',
};

/** Custom bottom tab bar: soft surface, hairline top border, tinted active pill. */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label =
          typeof options.title === 'string' ? options.title : route.name;
        const color = focused ? colors.roseDeep : colors.muted;

        return (
          <PressableScale
            key={route.key}
            scaleTo={0.92}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            testID={options.tabBarButtonTestID}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}>
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Icon name={TAB_ICONS[route.name] ?? 'Sparkle'} size={22} color={color} strokeWidth={focused ? 2 : 1.75} />
            </View>
            <AppText variant="caption" color={color}>
              {label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: spacing.sm,
    minHeight: layout.tabBarHeight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.roseSoft },
});
