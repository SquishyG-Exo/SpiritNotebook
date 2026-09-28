import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppText, Card, Icon } from '../../ui';

export interface EntryQuoteProps {
  text: string;
  hasPhoto?: boolean;
  /** Clamp long entries (used while loading). */
  maxLines?: number;
}

/** The user's own words, in a quiet card. */
export function EntryQuote({ text, hasPhoto, maxLines }: EntryQuoteProps) {
  const { t } = useTranslation();
  return (
    <Card tint={colors.surfaceTint} elevated={false} padding={spacing.lg}>
      <AppText variant="overline" color={colors.muted}>
        {t('reading.youWrote')}
      </AppText>
      <AppText variant="quote" color={colors.inkSoft} numberOfLines={maxLines} style={styles.quote}>
        {text}
      </AppText>
      {hasPhoto ? (
        <View style={styles.photo}>
          <Icon name="Image" size={14} color={colors.muted} />
          <AppText variant="caption" color={colors.muted}>
            {t('reading.photoAttached')}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  quote: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
  },
  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
});
