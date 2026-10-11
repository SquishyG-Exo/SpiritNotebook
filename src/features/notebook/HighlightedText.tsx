import { Text, type StyleProp, type TextStyle } from 'react-native';

import type { HighlightRange } from '../../lib/search';
import { colors, fonts, withAlpha } from '../../theme';
import { AppText, type AppTextProps } from '../../ui';

export interface HighlightedTextProps extends Omit<AppTextProps, 'children'> {
  text: string;
  /** Sorted, non-overlapping [start, end) ranges into `text`. */
  highlights: readonly HighlightRange[];
  highlightStyle?: StyleProp<TextStyle>;
}

/** Splits `text` into plain and highlighted runs; out-of-range or empty ranges are skipped. */
export function splitHighlights(text: string, highlights: readonly HighlightRange[]) {
  const runs: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;
  for (const [rawStart, rawEnd] of highlights) {
    const start = Math.max(cursor, rawStart);
    const end = Math.min(text.length, rawEnd);
    if (end <= start) continue;
    if (start > cursor) runs.push({ text: text.slice(cursor, start), highlighted: false });
    runs.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor), highlighted: false });
  return runs;
}

/** Body text with the matched words set in semibold on a soft gold wash. */
export function HighlightedText({ text, highlights, highlightStyle, ...rest }: HighlightedTextProps) {
  return (
    <AppText {...rest}>
      {splitHighlights(text, highlights).map((run, index) =>
        run.highlighted ? (
          <Text key={index} style={[styles.mark, highlightStyle]}>
            {run.text}
          </Text>
        ) : (
          run.text
        ),
      )}
    </AppText>
  );
}

const styles = {
  mark: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
    backgroundColor: withAlpha(colors.goldLight, 0.45),
    borderRadius: 3,
  },
} satisfies Record<string, TextStyle>;
