import type { RefObject } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, spacing, withAlpha } from '../../theme';
import { glass, glassBlur, Icon, PressableScale } from '../../ui';

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder: string;
  /** Screen-reader label for the field. */
  label: string;
  clearLabel: string;
  autoFocus?: boolean;
  inputRef?: RefObject<TextInput | null>;
}

/** Design 4 search pill: frosted white, a search glyph, the input and a round clear button. */
export function SearchField({
  value,
  onChangeText,
  onClear,
  placeholder,
  label,
  clearLabel,
  autoFocus,
  inputRef,
}: SearchFieldProps) {
  return (
    <View style={[glass.firm, glassBlur, styles.field]}>
      <View style={styles.glyph}>
        <Icon name="Search" size={21} color={colors.plumDeep} strokeWidth={1.9} />
      </View>
      {/* enterKeyHint gives phones a Search key; no inputMode="search", whose native clear button would double ours. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        // Results are live; the keyboard's Search key just steps aside to show them.
        onSubmitEditing={() => inputRef?.current?.blur()}
        accessibilityLabel={label}
        selectionColor={colors.plum}
        testID="search-input"
        style={styles.input}
      />
      {value.length > 0 ? (
        <PressableScale
          onPress={onClear}
          scaleTo={0.85}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          testID="search-clear"
          style={styles.clear}>
          <Icon name="X" size={13} color={colors.white} strokeWidth={2.8} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const HEIGHT = 54;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEIGHT,
    borderRadius: radius.pill,
    paddingLeft: spacing.lg + 2,
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  glyph: { flexShrink: 0 },
  input: {
    flex: 1,
    minWidth: 0,
    height: HEIGHT - 2,
    paddingVertical: 0,
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.ink,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.muted, 0.62),
  },
});
