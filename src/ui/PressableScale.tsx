import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 320 };

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. */
  scaleTo?: number;
}

/** Pressable with a soft spring scale on press. */
export function PressableScale({ scaleTo = 0.97, style, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        scale.set(withSpring(scaleTo, SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}
    />
  );
}
