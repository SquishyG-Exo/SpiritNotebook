import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../theme';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Apply the horizontal gutter. Default true. */
  padded?: boolean;
  background?: string;
  /** Which safe-area edges to pad. Default: top only (tab bar / composer handle bottom). */
  edges?: ('top' | 'bottom')[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding inside scroll content (e.g. above a floating button). */
  bottomSpace?: number;
}

/** Page container with safe-area handling and the shared gutter. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  background = colors.cream,
  edges = ['top'],
  style,
  contentStyle,
  bottomSpace = spacing.xxxl,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.fill, { backgroundColor: background }, style]}
        contentContainerStyle={[
          { paddingTop, paddingBottom: paddingBottom + bottomSpace },
          padded ? styles.padded : null,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: background, paddingTop, paddingBottom },
        padded ? styles.padded : null,
        style,
        contentStyle,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: layout.gutter },
});
