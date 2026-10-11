import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lifeSituations, type LifeSituationDef } from '../../../brand/categories';
import { lifeIntro, lifeTitle, situationLabel } from '../../lib/categoryCopy';
import { colors, fonts, layout, radius, shadow, spacing, withAlpha } from '../../theme';
import { AppText, GlassIconButton, goBackOrHome, Icon } from '../../ui';
import { SkyBackdrop } from '../../ui/art';
import { DateChip } from './DateChip';
import { dateParam, withDate } from './params';

const ICON_DISC = 38;

function SituationRow({ def, label, date, last }: { def: LifeSituationDef; label: string; date?: string; last: boolean }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/entry/new', params: { category: 'life', subcategory: def.key, ...withDate(date) } })
      }
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`situation-${def.key}`}
      style={({ pressed }) => [styles.row, last ? null : styles.rowDivider, pressed ? styles.rowPressed : null]}>
      <View style={styles.disc}>
        <Icon name={def.icon} size={20} color={colors.gold} strokeWidth={1.6} />
      </View>
      <AppText variant="bodyMedium" color={colors.ink} style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
      <Icon name="ChevronRight" size={20} color={colors.muted} />
    </Pressable>
  );
}

/** Life Situations: pick the part of life, then write. Passes ?date= through to the composer. */
export function LifeSituationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const date = dateParam(params.date);

  return (
    <View style={styles.root}>
      <SkyBackdrop scene="dusk" />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <GlassIconButton
            icon="ChevronLeft"
            label={t('common.actions.back')}
            onPress={goBackOrHome}
            iconOffset={-2}
            testID="life-back"
          />
        </View>

        <Animated.View entering={FadeInUp.duration(450)} style={styles.intro}>
          <View style={styles.titleIcon}>
            <Icon name="Sunrise" size={30} color={colors.gold} strokeWidth={1.5} />
          </View>
          <AppText variant="title" color={colors.plum} align="center" accessibilityRole="header">
            {lifeTitle(t)}
          </AppText>
          <AppText align="center" style={styles.subtitle}>
            {lifeIntro(t)}
          </AppText>
          {date ? <DateChip date={date} /> : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(500)} style={styles.list}>
          {lifeSituations.map((def, index) => (
            <SituationRow
              key={def.key}
              def={def}
              date={date}
              label={situationLabel(t, def.key)}
              last={index === lifeSituations.length - 1}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  topBar: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  titleIcon: {
    marginBottom: -spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.displayRegular,
    fontSize: 18,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  list: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    // A little more opaque than the tiles: long labels sit on it.
    backgroundColor: withAlpha(colors.cream, 0.82),
    overflow: 'hidden',
    ...shadow.tile,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withAlpha(colors.plum, 0.12),
  },
  rowPressed: {
    backgroundColor: withAlpha(colors.white, 0.6),
  },
  disc: {
    width: ICON_DISC,
    height: ICON_DISC,
    borderRadius: ICON_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.white, 0.75),
    borderWidth: 1,
    borderColor: withAlpha(colors.goldLight, 0.55),
  },
  label: {
    flex: 1,
  },
});
