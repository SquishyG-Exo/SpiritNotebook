import { Platform, StyleSheet, View, type Insets, type PressableProps } from 'react-native';

export type HitSlop = PressableProps['hitSlop'];

function toInsets(hitSlop: HitSlop): Insets | null {
  if (hitSlop == null) return null;
  if (typeof hitSlop === 'number') return { top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop };
  return hitSlop;
}

/**
 * Makes `hitSlop` work on the web, where react-native-web ignores it: an invisible box that
 * reaches past the pressable by the slop, so taps just outside a small control still land.
 * Render it as the first child of the Pressable that has the slop. Native builds use the real
 * `hitSlop`, so this renders nothing there. The area is clipped by any ancestor with
 * `overflow: hidden` (scroll views included), so leave room around the control. It is measured
 * from inside the control's border, so add the border width to the slop of a bordered control.
 */
export function HitSlopArea({ hitSlop }: { hitSlop: HitSlop }) {
  const insets = Platform.OS === 'web' ? toInsets(hitSlop) : null;
  if (!insets) return null;
  return (
    <View
      aria-hidden
      style={[
        styles.area,
        {
          top: -(insets.top ?? 0),
          bottom: -(insets.bottom ?? 0),
          left: -(insets.left ?? 0),
          right: -(insets.right ?? 0),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  area: { position: 'absolute' },
});
