import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { categoryByKey } from '../../../brand/categories';
import { formatDate } from '../../lib/dates';
import { resolveContent, useSettings, type JournalEntry } from '../../state';
import { colors, radius, spacing , withAlpha } from '../../theme';
import { AppText, Icon, IconCircle, PressableScale } from '../../ui';
import { entryTopicLabel } from '../../lib/categoryCopy';
import { excerpt } from './greeting';

const SOFT_TEXT = withAlpha(colors.cream, 0.74);

/** Frosted glass surface; the backdrop blur is a web-only nicety. */
const glassBlur =
  Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as unknown as ViewStyle) : null;

/** Frosted card over the water: the most recent saved entry, or a gentle empty state. */
export function LatestEntryCard({ entry }: { entry?: JournalEntry }) {
  const { t } = useTranslation();
  const { language } = useSettings();

  if (!entry) {
    return (
      <View style={[styles.card, glassBlur]}>
        <IconCircle name="Feather" size={44} tint={withAlpha(colors.white, 0.16)} color={colors.cream} />
        <View style={styles.body}>
          <AppText variant="smallMedium" color={colors.cream}>
            {t('home.empty')}
          </AppText>
          <AppText variant="caption" color={SOFT_TEXT}>
            {t('home.emptyHint')}
          </AppText>
        </View>
      </View>
    );
  }

  const def = categoryByKey(entry.category);
  const content = resolveContent(entry, language);
  const title = content.reading?.title?.trim() || excerpt(content.text);
  const meta = `${entryTopicLabel(t, entry.category, entry.subcategory)} · ${formatDate(new Date(entry.createdAt), language)}`;

  return (
    <PressableScale
      onPress={() => router.push(`/entry/${entry.id}`)}
      accessibilityRole="button"
      accessibilityLabel={t('home.openEntry', { title })}
      scaleTo={0.98}
      testID="home-latest"
      style={[styles.card, glassBlur]}>
      <IconCircle name={def.icon} size={44} tint={def.tint} color={def.accent} />
      <View style={styles.body}>
        <AppText variant="overline" color={SOFT_TEXT}>
          {t('home.latest')}
        </AppText>
        <AppText variant="subheading" color={colors.cream} numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" color={SOFT_TEXT} numberOfLines={1}>
          {meta}
        </AppText>
      </View>
      <Icon name="ChevronRight" size={20} color={SOFT_TEXT} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: withAlpha(colors.white, 0.3),
    backgroundColor: withAlpha(colors.white, 0.13),
  },
  body: {
    flex: 1,
    gap: 3,
  },
});
