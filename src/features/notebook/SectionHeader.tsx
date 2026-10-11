import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '../../theme';
import { AppText } from '../../ui';
import { glass } from './glass';

export interface SectionHeaderProps {
  title: string;
  /** A count or short hint on the right ("3 results"). */
  meta?: string;
  /** Announce changes to `meta` politely (e.g. a live result count). */
  live?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Serif section title on the sky with an optional count; the count wraps under a long title. */
export function SectionHeader({ title, meta, live, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <AppText style={[glass.sectionTitle, styles.title]} accessibilityRole="header">
        {title}
      </AppText>
      {meta ? (
        <AppText style={glass.sectionMeta} aria-live={live ? 'polite' : undefined}>
          {meta}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: spacing.md,
  },
  title: { flexShrink: 1 },
});
