import { Image, type ImageProps } from 'expo-image';

export type DecorativeImageProps = Omit<ImageProps, 'accessible' | 'accessibilityLabel' | 'alt'>;

/**
 * An image that is decoration only (the sky, the lotus, entry paintings): hidden
 * from screen readers, with an empty alt on the web so it is not announced as an
 * unlabelled image. expo-image writes `accessibilityLabel` to the img's alt (its
 * own `alt` prop is dropped once the picture has loaded), hence the empty label.
 * An image that carries meaning should use expo-image directly with a real label.
 */
export function DecorativeImage(props: DecorativeImageProps) {
  return <Image {...props} accessible={false} accessibilityLabel="" />;
}
