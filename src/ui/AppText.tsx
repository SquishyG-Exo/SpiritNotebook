import { Text, type TextProps } from 'react-native';

import { colors, type, type TypeVariant } from '../theme';

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[type[variant], { color: color ?? colors.ink }, align ? { textAlign: align } : null, style]}
    />
  );
}
