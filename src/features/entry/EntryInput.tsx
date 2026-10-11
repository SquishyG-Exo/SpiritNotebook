import { useState, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { brand } from '../../../brand/config';
import { colors, spacing, type } from '../../theme';
import { AppText, glass, glassBlur } from '../../ui';

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 320;

export interface EntryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Shown under the text while it is still shorter than the minimum. */
  tooShortHint: string;
  inputRef?: Ref<TextInput>;
}

/** The composer's writing surface: a frosted card that grows with the text, with a live counter. */
export function EntryInput({ value, onChangeText, placeholder, tooShortHint, inputRef }: EntryInputProps) {
  const { t } = useTranslation();
  const [height, setHeight] = useState(MIN_HEIGHT);
  const max = brand.ai.maxInputChars;
  const trimmed = value.trim().length;
  const tooShort = trimmed > 0 && trimmed < brand.ai.minInputChars;

  return (
    <View style={[glass.card, glassBlur, styles.card]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={max}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        selectionColor={colors.plum}
        accessibilityLabel={t('entry.inputLabel')}
        testID="entry-input"
        onContentSizeChange={(event) =>
          setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(event.nativeEvent.contentSize.height))))
        }
        style={[styles.input, { height }]}
      />
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.muted} style={styles.hint} accessibilityLiveRegion="polite">
          {tooShort ? tooShortHint : ''}
        </AppText>
        <AppText variant="caption" color={value.length >= max ? colors.roseDeep : colors.muted}>
          {t('entry.counter', { count: value.length, max })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  input: {
    ...type.body,
    color: colors.ink,
    textAlignVertical: 'top',
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  hint: {
    flex: 1,
  },
});
