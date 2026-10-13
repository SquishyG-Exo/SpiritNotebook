import type { ImageContentPosition } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradients } from '../../theme';
import { DecorativeImage } from './DecorativeImage';
import { art } from './images';

export type SkyScene = 'home' | 'dusk';

export interface SkyBackdropProps {
  /** 'home': the calm sunset over the sea. 'dusk': the same scene with more defined clouds. */
  scene?: SkyScene;
  /** Which part of the painting stays in view when it is cropped to the screen. */
  contentPosition?: ImageContentPosition;
  /** Decorative layers drawn over the painting (monogram, glows). Never text or controls. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Full-bleed watercolor sky behind a screen (Design 4). A soft gradient in the
 * painting's colours shows while the picture loads, so there is no flash of
 * blank page. Decorative: hidden from assistive tech, never intercepts touches.
 */
export function SkyBackdrop({ scene = 'home', contentPosition = 'top', children, style }: SkyBackdropProps) {
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.noTouch, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <LinearGradient
        colors={[gradients.dusk[2], gradients.dusk[1], gradients.dusk[0]]}
        style={StyleSheet.absoluteFill}
      />
      <DecorativeImage
        source={scene === 'home' ? art.skyHome : art.skyDusk}
        contentFit="cover"
        contentPosition={contentPosition}
        priority="high"
        loading="eager"
        transition={250}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  noTouch: {
    pointerEvents: 'none',
    overflow: 'hidden',
  },
});
