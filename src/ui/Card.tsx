import { View, type ViewProps } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

export interface CardProps extends ViewProps {
  /** Background color; defaults to white surface. */
  tint?: string;
  padding?: number;
  elevated?: boolean;
}

export function Card({ tint, padding = spacing.xl, elevated = true, style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tint ?? colors.surface,
          borderRadius: radius.lg,
          padding,
          borderWidth: 1,
          borderColor: colors.hairline,
        },
        elevated ? shadow.card : null,
        style,
      ]}
    />
  );
}
