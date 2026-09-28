import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { brand } from '../../../brand/config';
import { colors, radius, shadow, spacing, type } from '../../theme';
import { AppText, Button } from '../../ui';

export interface NoteEditorProps {
  initialValue?: string;
  submitLabel: string;
  onSubmit: (note: string) => void;
  onCancel: () => void;
  /** Keep the submit button disabled until something is written. */
  requireText?: boolean;
}

/** Inline "journal my thoughts" editor under a reading. */
export function NoteEditor({ initialValue = '', submitLabel, onSubmit, onCancel, requireText = true }: NoteEditorProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState(initialValue);
  const empty = note.trim().length === 0;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.root}>
      <View style={[styles.card, shadow.card]}>
        <AppText variant="overline" color={colors.roseDeep}>
          {t('reading.noteLabel')}
        </AppText>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          autoFocus
          maxLength={brand.ai.maxInputChars}
          placeholder={t('reading.notePlaceholder')}
          placeholderTextColor={colors.faint}
          selectionColor={colors.roseDeep}
          accessibilityLabel={t('reading.noteLabel')}
          testID="reading-note-input"
          style={styles.input}
        />
      </View>
      <Button
        label={submitLabel}
        onPress={() => onSubmit(note)}
        disabled={requireText && empty}
        testID="reading-note-submit"
      />
      <Button variant="ghost" label={t('common.actions.cancel')} onPress={onCancel} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    ...type.quote,
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
    minHeight: 120,
    marginTop: spacing.sm,
    textAlignVertical: 'top',
    padding: 0,
  },
});
