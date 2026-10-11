import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, fonts, spacing, withAlpha } from '../../theme';
import { AppText, glass, glassBlur, Icon, IconCircle, PressableScale } from '../../ui';

export interface EmptyStateProps {
  icon: string;
  title: string;
  hint?: string;
  /** Actions under the text (a Button, TextLinks). */
  children?: ReactNode;
  testID?: string;
}

/** A gentle glass card for empty lists: gold icon, serif title, one kind sentence, optional actions. */
export function EmptyState({ icon, title, hint, children, testID }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(320)} style={[glass.card, glassBlur, styles.card]} testID={testID}>
      <IconCircle name={icon} size={52} tint={withAlpha(colors.goldLight, 0.3)} color={colors.gold} strokeWidth={1.6} />
      <View style={styles.text}>
        <AppText style={styles.title} align="center" accessibilityRole="header">
          {title}
        </AppText>
        {hint ? (
          <AppText style={styles.hint} align="center">
            {hint}
          </AppText>
        ) : null}
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </Animated.View>
  );
}

export interface TextLinkProps {
  label: string;
  onPress: () => void;
  icon?: string;
  testID?: string;
}

/** A quiet plum text action with a chevron, for secondary choices. */
export function TextLink({ label, onPress, icon = 'ChevronRight', testID }: TextLinkProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={styles.link}>
      <AppText style={styles.linkText}>{label}</AppText>
      <View>
        <Icon name={icon} size={16} color={colors.plum} strokeWidth={2} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  text: { gap: spacing.xs, maxWidth: 320 },
  title: {
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 28,
    color: colors.plumDeep,
    fontVariant: ['lining-nums'],
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  actions: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs, alignSelf: 'stretch' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: spacing.xs, alignSelf: 'center' },
  linkText: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20, color: colors.plum },
});
