import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

/*
 * The "SN" (Spirit Notebook) monogram the client asked to see faintly in the
 * background, after the calligraphic sign she circled.
 *
 * Letterforms: the "S" and "N" glyph outlines of Rouge Script by Typesenses
 * (Copyright (c) 2011 Typesenses, Reserved Font Name "Rouge Script"), licensed
 * under the SIL Open Font License 1.1 (https://openfontlicense.org). The
 * outlines were extracted with fontTools, scaled and interlaced into one
 * mark, with a hand-drawn swash beneath them. No font file ships with the app.
 */

/** Width / height of the mark. */
export const MONOGRAM_ASPECT = 327 / 302;

const S_PATH = [
  'M10.4 201Q2.5 186.1 2.5 165.9Q2.5 147.2 8.8 132.4Q15.2 117.7 22.8 108.7Q30.4 99.7 41.2 94.3',
  'Q52.2 88.9 64.4 88.9Q81.7 88.9 92 98.8L123.5 72.3Q122.5 64 122.5 55.8Q122.5 2.5 150.6 2.5',
  'Q157.8 2.5 161.8 7.5Q165.9 12.6 166.4 20.5Q166.7 32 159.1 43.5Q151.6 55 136.9 68.8',
  'Q144.3 118.4 144.3 136.3Q144.3 154.2 139.8 170.8Q135.2 187.6 125.8 201.2Q116.5 214.9 100.2 222.6',
  'Q83.8 230.2 62.2 230.2Q31.3 230.2 15.4 209.2Q11.2 224.2 11.2 243.6Q11.2 262.9 21.4 278.4',
  'Q31.6 293.9 47.6 293.9Q48.8 293.9 49 296.2Q49 298.6 47.6 298.6Q28.6 298.6 16.4 280.8',
  'Q4.2 262.9 4.2 241.1Q4.2 219.2 10.4 201ZM96.1 103.3Q102.8 112.4 102.8 123.8',
  'Q102.8 135.2 99.3 144.2Q95.8 153.2 87.1 160.1Q78.3 166.9 66.8 166.9Q64.4 166.9 63.1 165.7',
  'Q61.8 164.5 61.3 161.8Q71.6 161.8 80.2 152.2Q92.8 138.8 92.8 122Q92.8 115 90.1 108.6',
  'Q63.2 131.6 44.8 153.7Q26.2 175.8 17.6 201.7Q31.3 223.8 60.6 223.8Q78.6 223.8 92.2 216.2',
  'Q105.7 208.7 113.4 195.7Q128.5 170.2 128.5 134Q128.5 125.2 124.2 80ZM86.5 103.5',
  'Q78.8 95.4 65.4 95.4Q52 95.4 41.1 101.8Q21.2 113.8 12.6 142.2Q8.8 154.2 8.8 166.9',
  'Q8.8 181.1 13.3 193.1Q29.9 151.6 86.5 103.5ZM134.8 43.5Q134.8 50 135.9 60.8',
  'Q159.7 37.5 159.7 21.4Q159.7 9 150.6 9Q134.8 9 134.8 43.5Z',
].join('');

const N_PATH = [
  'M117.3 91.9Q129.1 63.4 166.7 63.4Q179.7 63.4 205.1 71.9Q213.6 60.1 224.4 60.1',
  'Q225.9 60.1 226.6 61Q227.3 61.9 227.6 63.6Q217.4 63.6 209.7 73.2Q215.6 74.6 221.5 75.3',
  'Q227.7 62.7 234.2 62.7Q237.1 62.7 237.7 64.5L237.8 65.2Q233.4 65.2 229.6 75.7',
  'Q240.2 75.5 244.1 67.3Q245.4 64.7 245.4 62.4Q245.4 60.1 243.8 58.5Q242.3 57 240.2 57',
  'Q241.2 54.2 244.1 54.2Q249.4 54.2 251.1 60.5Q251.7 62.3 251.7 64.1Q251.7 69.7 246.3 74.9',
  'Q241 80.2 230.3 80.2H228.1Q222.8 97.6 220.7 122.2Q218.5 146.8 218.5 163.1',
  'Q218.5 204.5 225.9 204.5Q229 204.5 233.6 189.6Q238.2 174.7 244 153.6Q249.8 132.4 256.9 111.2',
  'Q264 89.9 274.5 75Q284.9 60.1 296.9 60.1Q299.5 60.1 301.2 61.4Q303 62.7 303.7 65.4',
  'Q290.1 65.4 279 80.8Q267.9 96.2 260.7 118.2Q253.5 140.3 247.5 162.3Q241.5 184.3 235.6 199.7',
  'Q229.6 215 223.7 215Q214.5 215 210.1 199.9Q205.7 184.8 205.7 165.3Q205.7 142.9 209.6 118.5',
  'Q213.6 94.1 219.6 79.4Q213 78.3 207.1 76.7Q196.8 92.5 187.4 135.2Q183.8 151.9 177.5 170.1',
  'Q171.2 188.3 163.6 202.1Q156 215.9 142.6 224.9Q129.3 234 111.6 234Q84.6 234 72.2 214.7',
  'Q65.5 203.8 65.5 191.3Q65.5 186.1 66.5 180.8Q70.4 162.9 84 155.4Q91.2 151.3 100 151.3',
  'Q119 151.3 125.6 166.1Q128.4 172.2 128.4 178.5Q128.4 184.8 125.8 191.3Q119.5 206.7 105.4 206.7',
  'Q103.2 206.7 101.7 205.7Q100.2 204.7 99.5 202.7Q104.5 202.7 108.9 200.1Q116.2 195.7 120.3 184.1',
  'Q121.5 180.2 121.5 177.8Q121.5 175.3 121.2 172.1Q120.8 168.8 118.8 164.6Q116.8 160.4 111.8 157.8',
  'Q106.8 155.2 100 155.2Q82.5 155.2 74.3 170.7Q69.5 179.5 69.5 187.4Q69.5 195.3 71.2 201.6',
  'Q75.9 219.1 91.2 225.7Q98.4 228.8 107 228.8Q122.8 228.8 135.3 220.2Q147.9 211.5 155.6 198.4',
  'Q163.3 185.2 170.2 167.6Q177.1 149.9 181.3 133.7Q192.4 92.7 202.9 75.3Q202 75.2 198 73.9',
  'Q194.1 72.6 192.7 72.2Q191.3 71.9 187.7 71Q184.1 70 182.1 69.7Q180.1 69.3 176.9 68.7',
  'Q171.4 67.8 164.8 67.8Q140.9 67.8 129.5 85.8Q122.8 96 122.8 106.8Q122.8 110 123.6 113.3',
  'Q125.6 125.2 134.2 127.6Q135.9 128.2 137.8 128.2Q136.7 132.2 131.7 132.2Q120.5 132.2 115.8 120.2',
  'Q113.7 114.5 113.7 107.5Q113.7 100.6 117.3 91.9Z',
].join('');

const SWASH_PATH = [
  'M31.4 258.1C88.5 286.6 246 278.7 323.9 190.6C243.4 272 89 279.4 31.4 258.1Z',
].join('');

/** One path: overlapping strokes union under the nonzero rule, so a translucent fill never doubles up. */
const MONOGRAM_PATH = S_PATH + N_PATH + SWASH_PATH;

export interface MonogramProps {
  /** Width in px; the height follows MONOGRAM_ASPECT. */
  size: number;
  color?: string;
  /** Keep it faint (about 0.10 to 0.16): it is a background mark, never over text. */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/** Decorative and silent: hidden from assistive tech and never intercepts touches. */
export function Monogram({ size, color = colors.plum, opacity = 0.12, style }: MonogramProps) {
  const height = Math.round(size / MONOGRAM_ASPECT);
  return (
    <View
      style={[styles.wrap, { width: size, height, opacity }, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden>
      <Svg width={size} height={height} viewBox="0 0 327 302">
        <Path d={MONOGRAM_PATH} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    pointerEvents: 'none',
  },
});
