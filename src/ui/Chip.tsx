import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

export type ChipTone = 'neutral' | 'rose' | 'lavender' | 'peach' | 'premium' | 'ink';

const TONES: Record<ChipTone, { background: string; text: string }> = {
  neutral: { background: colors.surfaceTint, text: colors.inkSoft },
  rose: { background: colors.roseSoft, text: colors.roseDeep },
  lavender: { background: colors.lavenderSoft, text: colors.lavenderDeep },
  peach: { background: colors.peachSoft, text: '#B96F3F' },
  premium: { background: '#FBEFD6', text: '#86591A' },
  ink: { background: colors.ink, text: colors.cream },
};

export interface ChipProps extends ViewProps {
  label: string;
  tone?: ChipTone;
  icon?: ReactNode;
  /** Override colors, e.g. a category tint/accent. */
  background?: string;
  color?: string;
}

export function Chip({ label, tone = 'neutral', icon, background, color, style, ...rest }: ChipProps) {
  const palette = TONES[tone];
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2,
          alignSelf: 'flex-start',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
          borderRadius: radius.pill,
          backgroundColor: background ?? palette.background,
        },
        style,
      ]}>
      {icon}
      <AppText variant="caption" color={color ?? palette.text}>
        {label}
      </AppText>
    </View>
  );
}
