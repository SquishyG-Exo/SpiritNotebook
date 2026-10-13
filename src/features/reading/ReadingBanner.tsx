import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { categoryByKey } from '../../../brand/categories';
import { entryTopicLabel } from '../../lib/categoryCopy';
import type { JournalEntry } from '../../state';
import { colors, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, glassBlur, Icon, IconCircle } from '../../ui';
import { DecorativeImage, DreamBanner } from '../../ui/art';
import { entryImage } from '../../ui/art/images';

const BANNER_HEIGHT = 196;

/** A small frosted chip that stays legible over the painting. */
export function PhotoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={[styles.chip, glassBlur]}>
      <Icon name={icon} size={14} color={colors.gold} strokeWidth={2} />
      <AppText variant="caption" color={colors.ink} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

export interface ReadingBannerProps {
  entry: JournalEntry;
  /** Extra chips (e.g. the lab's advisor marker). */
  extra?: ReactNode;
}

/**
 * Photo-led header for a reading (Design 4): the entry's painting, or its
 * sample photo, rounded, with a soft dusk overlay and the topic chips.
 */
export function ReadingBanner({ entry, extra }: ReadingBannerProps) {
  const { t } = useTranslation();
  const def = categoryByKey(entry.category);

  return (
    <View style={styles.banner} testID="reading-banner">
      <DecorativeImage
        source={entryImage(entry)}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={[withAlpha(colors.navDark, 0), withAlpha(colors.navDark, 0.42)]}
        start={{ x: 0, y: 0.35 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.passive]}
      />
      <View style={styles.chips}>
        <PhotoChip icon={def.icon} label={entryTopicLabel(t, entry.category, entry.subcategory)} />
        {entry.hasPhoto ? <PhotoChip icon="Image" label={t('reading.photoAttached')} /> : null}
        {entry.isSample ? <PhotoChip icon="Sparkle" label={t('common.sample')} /> : null}
        {extra}
      </View>
    </View>
  );
}

/**
 * The care result's calm header: a still dawn scene with no butterflies,
 * sparkles or glow, fading into the panel it opens, with the heart in the middle.
 */
export function CareBanner({ fadeTo, style }: { fadeTo: string; style?: StyleProp<ViewStyle> }) {
  return (
    <DreamBanner
      variant="dawn"
      height={120}
      fadeTo={fadeTo}
      butterflies="none"
      sparkles={false}
      glow={false}
      style={style}
      contentStyle={styles.centered}>
      <View style={styles.ring}>
        <IconCircle name="Heart" size={56} tint={withAlpha(colors.white, 0.84)} color={colors.roseDeep} strokeWidth={1.5} />
      </View>
    </DreamBanner>
  );
}

const styles = StyleSheet.create({
  passive: {
    pointerEvents: 'none',
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.8),
    ...shadow.tile,
  },
  chips: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
    paddingHorizontal: spacing.sm + 3,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.white, 0.86),
    maxWidth: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.6),
    backgroundColor: withAlpha(colors.white, 0.3),
  },
});

