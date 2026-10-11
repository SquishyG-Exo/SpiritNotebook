import { StyleSheet } from 'react-native';

import { colors, withAlpha } from '../../theme';
import { Icon, PressableScale } from '../../ui';

export interface HeartButtonProps {
  /** What tapping does, read by screen readers ("Remove … from Saved"). */
  label: string;
  onPress: () => void;
  filled?: boolean;
  testID?: string;
}

/** The filled heart on a saved entry or whisper; tapping it un-saves. */
export function HeartButton({ label, onPress, filled = true, testID }: HeartButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.82}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={styles.button}>
      <Icon
        name="Heart"
        size={20}
        color={colors.roseDeep}
        fill={filled ? colors.roseDeep : 'none'}
        strokeWidth={1.8}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.roseSoft, 0.7),
  },
});
