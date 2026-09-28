import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon } from './icons';

export interface HeaderProps {
  title?: string;
  /** Defaults to router.back(), falling back to Home. */
  onBack?: () => void;
  hideBack?: boolean;
  right?: ReactNode;
  /** Text/icon color, e.g. white over a gradient. */
  color?: string;
  backLabel?: string;
}

export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Simple stack header: back chevron, centered title, optional right slot. */
export function Header({ title, onBack, hideBack, right, color = colors.ink, backLabel = 'Back' }: HeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {hideBack ? null : (
          <Pressable
            onPress={onBack ?? goBackOrHome}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed ? styles.pressed : null]}>
            <Icon name="ChevronLeft" size={26} color={color} strokeWidth={2} />
          </Pressable>
        )}
      </View>
      <View style={styles.center}>
        {title ? (
          <AppText variant="heading" color={color} align="center" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: spacing.sm,
  },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  pressed: { opacity: 0.6 },
});
