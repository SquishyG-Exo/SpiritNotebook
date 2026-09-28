import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radius, shadow, spacing, type } from '../theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'dark';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.roseDeep,
  ghost: colors.inkSoft,
  light: colors.ink,
  dark: colors.cream,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const height = size === 'lg' ? 56 : 46;
  const textColor = TEXT_COLOR[variant];

  const content = (
    <View style={[styles.content, { height }]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <AppText variant="button" color={textColor} style={size === 'md' ? { fontSize: 15 } : null}>
            {label}
          </AppText>
          {iconRight}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      style={[
        styles.base,
        fullWidth ? styles.fullWidth : null,
        variant === 'primary' ? shadow.glow : null,
        variant === 'light' ? [styles.light, shadow.soft] : null,
        variant === 'dark' ? styles.dark : null,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'ghost' ? styles.ghost : null,
        inactive ? styles.inactive : null,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={gradients.cta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  light: { backgroundColor: colors.white },
  dark: { backgroundColor: colors.ink },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.rose,
  },
  ghost: { backgroundColor: 'transparent' },
  inactive: { opacity: 0.55 },
});

export const buttonTextStyle = type.button;
