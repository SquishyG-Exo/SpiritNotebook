// Per-weight entry points keep the unused DM Sans weights out of the web export.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';

/**
 * Keys must match brand.fonts values.
 *
 * Cormorant Garamond ships subset to the Latin range (scripts/fonts/subset-cormorant.sh):
 * the full files are 400–670 KB each, mostly Cyrillic, Greek and Vietnamese glyphs the app
 * never shows. The app waits for its fonts before the first paint, so this shortens the
 * splash on a phone connection. Licence: assets/fonts/OFL.txt.
 */
export const fontAssets = {
  CormorantGaramond_500Medium: require('../../assets/fonts/CormorantGaramond_500Medium.ttf'),
  CormorantGaramond_500Medium_Italic: require('../../assets/fonts/CormorantGaramond_500Medium_Italic.ttf'),
  CormorantGaramond_600SemiBold: require('../../assets/fonts/CormorantGaramond_600SemiBold.ttf'),
  CormorantGaramond_700Bold: require('../../assets/fonts/CormorantGaramond_700Bold.ttf'),
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
};
