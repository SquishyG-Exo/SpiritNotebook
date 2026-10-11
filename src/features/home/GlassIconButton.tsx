import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadow, withAlpha } from '../../theme';
import { Icon, PressableScale, type IconName } from '../../ui';

export interface GlassIconButtonProps {
  icon: IconName;
  /** Screen-reader label (the button has no visible text). */
  label: string;
  onPress: () => void;
  /** Nudges the glyph horizontally; chevrons look off-centre otherwise. */
  iconOffset?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const GLASS_BUTTON_SIZE = 44;

/** Round frosted button for the top bars over the sky art (gear, profile, back). 44 px target. */
export function GlassIconButton({ icon, label, onPress, iconOffset = 0, testID, style }: GlassIconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={[styles.button, style]}>
      <Icon
        name={icon}
        size={22}
        color={colors.plum}
        strokeWidth={1.75}
        style={iconOffset ? { marginLeft: iconOffset } : undefined}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: GLASS_BUTTON_SIZE,
    height: GLASS_BUTTON_SIZE,
    borderRadius: GLASS_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.62),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.tile,
  },
});
