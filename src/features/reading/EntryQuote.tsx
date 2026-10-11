import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppText, Icon } from '../../ui';
import { glass, glassBlur } from '../entry/scenery';

export interface EntryQuoteProps {
  text: string;
  /** The reader's own title, when they gave one. */
  title?: string;
  hasPhoto?: boolean;
  /** Clamp long entries (used while loading). */
  maxLines?: number;
}

/** The reader's own words (and title), in a quiet frosted card. */
export function EntryQuote({ text, title, hasPhoto, maxLines }: EntryQuoteProps) {
  const { t } = useTranslation();
  const ownTitle = title?.trim();
  return (
    <View style={[glass.card, glassBlur, styles.card]} testID="entry-quote">
      <AppText variant="overline" color={colors.goldDeep}>
        {t('reading.youWrote')}
      </AppText>
      {ownTitle ? (
        <AppText variant="heading" color={colors.plum} style={[styles.title, glass.lining]} testID="entry-quote-title">
          {ownTitle}
        </AppText>
      ) : null}
      <AppText variant="quote" color={colors.inkSoft} numberOfLines={maxLines} style={[styles.quote, glass.lining]}>
        {text}
      </AppText>
      {hasPhoto ? (
        <View style={styles.photo}>
          <Icon name="Image" size={14} color={colors.gold} />
          <AppText variant="caption" color={colors.muted}>
            {t('reading.photoAttached')}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 22,
    lineHeight: 28,
  },
  quote: {
    marginTop: spacing.sm,
    fontSize: 18,
    lineHeight: 26,
  },
  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
});
