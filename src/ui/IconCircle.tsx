import { View, type ViewProps } from 'react-native';

import { colors } from '../theme';
import { Icon, type IconProps } from './icons';

export interface IconCircleProps extends ViewProps {
  name: IconProps['name'];
  /** Circle diameter. */
  size?: number;
  tint?: string;
  color?: string;
  strokeWidth?: number;
}

/** A line icon on a soft tinted disc, used for category tiles and list rows. */
export function IconCircle({
  name,
  size = 48,
  tint = colors.lavenderSoft,
  color = colors.lavenderDeep,
  strokeWidth,
  style,
  ...rest
}: IconCircleProps) {
  return (
    <View
      {...rest}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Icon name={name} size={Math.round(size * 0.46)} color={color} strokeWidth={strokeWidth} />
    </View>
  );
}
