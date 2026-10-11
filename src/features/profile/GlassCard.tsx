import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, Icon, type IconName } from '../../ui';

/**
 * Frosted card for Profile over the sky art. More opaque than the Home
 * tiles (paragraphs sit on it), so muted text keeps AA contrast.
 */
export function GlassCard({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          padding: spacing.xl,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: withAlpha(colors.cream, 0.86),
        },
        shadow.tile,
        style,
      ]}
    />
  );
}

/** Gold line icon + section title, the header row of a Profile card. */
export function SectionTitle({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View style={styles.labelRow}>
      <Icon name={icon} size={19} color={colors.gold} strokeWidth={1.75} />
      <AppText variant="subheading" color={colors.ink} accessibilityRole="header">
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
