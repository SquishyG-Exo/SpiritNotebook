import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../../theme';
import { useLightStatusBar } from '../../ui';
import { SkyBackdrop } from '../../ui/art';
import { TAB_SCENE_CLEARANCE } from '../../ui/TabBar';

/**
 * Journal screens (Search, Notebook, Calendar, Saved, Insights): the
 * watercolor sky fixed behind the page. The violet band belongs to SkyHeader
 * and scrolls away with it, so section titles never pass over it. Put a
 * ScrollView / FlatList / SectionList inside, styled with `skyPage`.
 */
export function SkyPage({ children }: { children: ReactNode }) {
  useLightStatusBar();
  return (
    <View style={styles.root}>
      <SkyBackdrop scene="dusk" />
      {children}
    </View>
  );
}

/** Scroll padding: under the status bar at the top; clear of the tab bar or the home indicator below. */
export function useSkyPadding(kind: 'tab' | 'stack') {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: insets.top,
    paddingBottom: kind === 'tab' ? TAB_SCENE_CLEARANCE + spacing.xl : insets.bottom + spacing.xxxl,
  };
}

export const skyPage = StyleSheet.create({
  /** The scroll view itself: transparent so the sky shows through. */
  scroll: { flex: 1, backgroundColor: 'transparent' },
  /** Phone-width column with the shared gutter, centred on wider windows. */
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, overflow: 'hidden' },
});
