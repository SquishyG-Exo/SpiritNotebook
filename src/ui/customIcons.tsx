import type { LucideProps } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Line icons lucide does not ship, drawn on the same 24×24 grid with round
 * caps and joins so they sit naturally next to lucide icons.
 */
function LineIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  paths,
}: Pick<LucideProps, 'size' | 'color' | 'strokeWidth'> & { paths: string[] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}

const BUTTERFLY = [
  'M12 8.5v10',
  'M12 8.5c-.6-1.7-1.6-2.9-2.9-3.4',
  'M12 8.5c.6-1.7 1.6-2.9 2.9-3.4',
  'M12 10.5C10.2 6.6 6.1 4.9 4.1 6.6c-1.8 1.6-.4 5.4 7.9 6.1',
  'M12 10.5c1.8-3.9 5.9-5.6 7.9-3.9 1.8 1.6.4 5.4-7.9 6.1',
  'M12 12.7c-4.4.4-6.4 2.6-5.2 4.9 1.1 2 3.9 1.2 5.2-1.6',
  'M12 12.7c4.4.4 6.4 2.6 5.2 4.9-1.1 2-3.9 1.2-5.2-1.6',
];

const LOTUS = [
  'M12 4.2c2.4 2.8 2.4 7.3 0 10.6-2.4-3.3-2.4-7.8 0-10.6Z',
  'M12 14.8C9.1 14.6 6.3 12.4 5.2 8.6c2.8.1 5.2 2 6.8 6.2',
  'M12 14.8c2.9-.2 5.7-2.4 6.8-6.2-2.8.1-5.2 2-6.8 6.2',
  'M12 14.8c-3.7.9-7.2-.1-9.3-2.6 2.9-1 6.3-.2 9.3 2.6',
  'M12 14.8c3.7.9 7.2-.1 9.3-2.6-2.9-1-6.3-.2-9.3 2.6',
  'M6.5 18.2c3.6 1.4 7.4 1.4 11 0',
];

export function Butterfly(props: LucideProps) {
  return <LineIcon {...props} paths={BUTTERFLY} />;
}

export function Lotus(props: LucideProps) {
  return <LineIcon {...props} paths={LOTUS} />;
}
