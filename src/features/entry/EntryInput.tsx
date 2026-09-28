import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { brand } from '../../../brand/config';
import { colors, radius, shadow, spacing, type } from '../../theme';
import { AppText } from '../../ui';

const MIN_HEIGHT = 170;
const MAX_HEIGHT = 340;

export interface EntryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

/** The composer's writing surface: a calm white card that grows with the text, with a live counter. */
export function EntryInput({ value, onChangeText, placeholder }: EntryInputProps) {
  const { t } = useTranslation();
  const [height, setHeight] = useState(MIN_HEIGHT);
  const max = brand.ai.maxInputChars;
  const trimmed = value.trim().length;
  const tooShort = trimmed > 0 && trimmed < brand.ai.minInputChars;

  return (
    <View style={[styles.card, shadow.card]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={max}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        selectionColor={colors.roseDeep}
        accessibilityLabel={t('entry.inputLabel')}
        testID="entry-input"
        onContentSizeChange={(event) =>
          setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(event.nativeEvent.contentSize.height))))
        }
        style={[styles.input, { height }]}
      />
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.muted} style={styles.hint}>
          {tooShort ? t('entry.tooShort') : ''}
        </AppText>
        <AppText variant="caption" color={value.length >= max ? colors.roseDeep : colors.faint}>
          {t('entry.counter', { count: value.length, max })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
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
