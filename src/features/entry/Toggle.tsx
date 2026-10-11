import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, withAlpha } from '../../theme';

const TRACK_W = 46;
const TRACK_H = 28;
const THUMB = 22;
const TRAVEL = TRACK_W - THUMB - 6;

/** The visual part of a switch; the row around it owns the press and the accessibility role. */
export function Toggle({ value }: { value: boolean }) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(value ? 1 : 0, { duration: 180 }));
  }, [progress, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: TRAVEL * progress.get() }],
  }));

  return (
    <View style={[styles.track, value ? styles.trackOn : null]}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: 3,
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.muted, 0.28),
  },
  trackOn: {
    backgroundColor: colors.plum,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.white,
    boxShadow: `0 1px 4px ${withAlpha(colors.ink, 0.25)}`,
  },
});
