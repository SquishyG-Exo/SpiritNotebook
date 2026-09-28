import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Language } from '../../state';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { AppText } from '../../ui';

const OPTIONS: readonly Language[] = ['en', 'es'];
const INSET = 4;

/** Two-pill segmented control with a sliding thumb. */
export function LanguageSwitch({ value, onChange }: { value: Language; onChange: (next: Language) => void }) {
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, OPTIONS.indexOf(value));
  const segment = trackWidth > 0 ? (trackWidth - INSET * 2) / OPTIONS.length : 0;

  const offset = useSharedValue(0);
  useEffect(() => {
    offset.set(withSpring(index * segment, { damping: 20, stiffness: 240 }));
  }, [offset, index, segment]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout} accessibilityRole="radiogroup" accessibilityLabel={t('common.language.label')}>
      {segment > 0 ? <Animated.View style={[styles.thumb, { width: segment }, thumbStyle]} /> : null}
      {OPTIONS.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={t(`common.language.${option}`)}
            style={[styles.option, segment === 0 && selected ? styles.optionFallback : null]}>
            <AppText
              variant="smallMedium"
              color={selected ? colors.ink : colors.muted}
              style={selected ? styles.selectedText : null}>
              {t(`common.language.${option}`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: INSET,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  thumb: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    left: INSET,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  option: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  /** Before the first layout pass, mark the selection without the thumb. */
  optionFallback: { backgroundColor: colors.surface },
  selectedText: { fontFamily: fonts.bodySemiBold },
});
