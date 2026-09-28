import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { colors, gradients, radius, spacing } from '../../theme';
import { AppText, Icon } from '../../ui';
import { withAlpha } from '../home/withAlpha';

export interface PhotoAttachmentProps {
  hasPhoto: boolean;
  onChange: (hasPhoto: boolean) => void;
}

/**
 * UI-only photo attachment for the proof of concept: toggles an illustrative
 * gradient thumbnail instead of opening the camera roll.
 */
export function PhotoAttachment({ hasPhoto, onChange }: PhotoAttachmentProps) {
  const { t } = useTranslation();

  if (!hasPhoto) {
    return (
      <Pressable
        onPress={() => onChange(true)}
        accessibilityRole="button"
        testID="entry-add-photo"
        style={({ pressed }) => [styles.chip, pressed ? styles.chipPressed : null]}>
        <Icon name="Camera" size={18} color={colors.roseDeep} />
        <AppText variant="smallMedium" color={colors.inkSoft}>
          {t('entry.addPhoto')}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.attached}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.thumbWrap}>
        <LinearGradient
          colors={gradients.sky}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumb}>
          <View style={styles.thumbSun} />
          <Icon name="Image" size={18} color={colors.white} />
        </LinearGradient>
        <Pressable
          onPress={() => onChange(false)}
          accessibilityRole="button"
          accessibilityLabel={t('entry.removePhoto')}
          hitSlop={10}
          style={styles.remove}>
          <Icon name="X" size={12} color={colors.white} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
      <Animated.View entering={FadeIn.duration(320)} style={styles.noteWrap}>
        <AppText variant="caption" color={colors.muted}>
          {t('entry.photoNote')}
        </AppText>
      </Animated.View>
    </View>
  );
}

const THUMB = 64;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  chipPressed: {
    backgroundColor: colors.surfaceTint,
  },
  attached: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbSun: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    bottom: 10,
    right: 8,
    backgroundColor: withAlpha(colors.cream, 0.55),
  },
  remove: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  noteWrap: {
    flex: 1,
  },
});
