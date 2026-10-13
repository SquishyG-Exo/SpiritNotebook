import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import type { CategoryKey } from '../../../brand/categories';
import { colors, radius, spacing } from '../../theme';
import { AppText, glass, glassBlur, HitSlopArea, Icon } from '../../ui';
import { DecorativeImage } from '../../ui/art';
import { categoryThumbs } from '../../ui/art/images';

export interface PhotoAttachmentProps {
  hasPhoto: boolean;
  onChange: (hasPhoto: boolean) => void;
  category: CategoryKey;
}

/**
 * UI-only photo attachment for the proof of concept: shows an illustrative
 * painting instead of opening the camera roll.
 */
export function PhotoAttachment({ hasPhoto, onChange, category }: PhotoAttachmentProps) {
  const { t } = useTranslation();

  if (!hasPhoto) {
    return (
      <Pressable
        onPress={() => onChange(true)}
        accessibilityRole="button"
        testID="entry-add-photo"
        style={({ pressed }) => [glass.pill, glassBlur, styles.chip, pressed ? styles.pressed : null]}>
        <Icon name="Camera" size={18} color={colors.gold} strokeWidth={1.9} />
        <AppText variant="smallMedium" color={colors.inkSoft}>
          {t('entry.addPhoto')}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.attached}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.thumbWrap}>
        <DecorativeImage source={categoryThumbs[category]} style={styles.thumb} contentFit="cover" />
        <Pressable
          onPress={() => onChange(false)}
          accessibilityRole="button"
          accessibilityLabel={t('entry.removePhoto')}
          hitSlop={10}
          testID="entry-remove-photo"
          style={styles.remove}>
          <HitSlopArea hitSlop={10} />
          <Icon name="X" size={12} color={colors.white} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
      <Animated.View entering={FadeIn.duration(320)} style={styles.noteWrap}>
        <AppText variant="smallMedium" color={colors.ink}>
          {t('entry.photoAdded')}
        </AppText>
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
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.75,
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
    borderWidth: 2,
    borderColor: colors.white,
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
    backgroundColor: colors.plum,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  noteWrap: {
    flex: 1,
    gap: 2,
  },
});
