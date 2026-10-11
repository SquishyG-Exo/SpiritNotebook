#!/usr/bin/env bash
# Subsets Cormorant Garamond to the Latin range the app needs (English, Spanish and other
# Latin-script names), dropping Cyrillic, Greek and Vietnamese glyphs: about 70% smaller.
# Keeps kerning and the lnum/tnum figures the app asks for (fontVariant: lining-nums, tabular-nums).
# Requires fonttools (pip install fonttools). Run from the repository root.
set -euo pipefail
src=node_modules/@expo-google-fonts/cormorant-garamond
out=assets/fonts
mkdir -p "$out"
for weight in 500Medium 500Medium_Italic 600SemiBold 700Bold; do
  pyftsubset "$src/$weight/CormorantGaramond_$weight.ttf" \
    --unicodes="U+0000-024F,U+0259,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-036F,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2212,U+2215,U+FEFF,U+FFFD" \
    --layout-features+=lnum,tnum,onum,pnum,case \
    --no-hinting --name-IDs='*' --name-languages='*' \
    --output-file="$out/CormorantGaramond_$weight.ttf"
done
cp "$src/LICENSE_FONT" "$out/OFL.txt"
echo "Subset fonts written to $out"
