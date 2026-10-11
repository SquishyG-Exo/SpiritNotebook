import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadow, withAlpha } from '../theme';
import { Icon } from './icons';
import { PressableScale } from './PressableScale';

export const GLASS_BUTTON_SIZE = 44;

export interface GlassIconButtonProps {
  /** A name registered in src/ui/icons.tsx. */
  icon: string;
  /** Screen-reader label (the button has no visible text). */
  label: string;
  onPress: () => void;
  /** Diameter; the glyph is half of it. Defaults to a 44 px target. */
  size?: number;
  iconColor?: string;
  /** Fills the glyph, e.g. a saved heart. */
  fill?: string;
  /** A toggle's state (a saved heart), announced as pressed. */
  selected?: boolean;
  disabled?: boolean;
  /** Nudges the glyph horizontally; chevrons look off-centre otherwise. */
  iconOffset?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Round frosted button over the sky art: back, gear, profile, heart, share. */
export function GlassIconButton({
  icon,
  label,
  onPress,
  size = GLASS_BUTTON_SIZE,
  iconColor = colors.plum,
  fill,
  selected,
  disabled,
  iconOffset = 0,
  testID,
  style,
}: GlassIconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      aria-pressed={selected}
      testID={testID}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Icon
        name={icon}
        size={Math.round(size / 2)}
        color={iconColor}
        fill={fill ?? 'none'}
        strokeWidth={1.75}
        style={iconOffset ? { marginLeft: iconOffset } : undefined}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.62),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.tile,
  },
  disabled: { opacity: 0.5 },
});
