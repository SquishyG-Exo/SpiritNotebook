import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

import { lifeSituations, type LifeSituationDef } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText, Card, Icon, IconCircle, Screen } from '../../ui';
import { lifeIntro, lifeTitle, situationColors, situationLabel } from '../../lib/categoryCopy';
import { pageStyle } from './pageStyle';
import { ScreenBanner } from './ScreenBanner';

function SituationRow({ def, label, index, last }: { def: LifeSituationDef; label: string; index: number; last: boolean }) {
  const { tint, accent } = situationColors(def.key);
  return (
    <Animated.View entering={FadeInRight.delay(100 + index * 35).duration(420)}>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/entry/new', params: { category: 'life', subcategory: def.key } })
        }
        accessibilityRole="button"
        accessibilityLabel={label}
        testID={`situation-${def.key}`}
        style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
        <IconCircle name={def.icon} size={40} tint={tint} color={accent} />
        <AppText variant="bodyMedium" style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
        <Icon name="ChevronRight" size={20} color={colors.faint} />
      </Pressable>
      {last ? null : <View style={styles.separator} />}
    </Animated.View>
  );
}

export function LifeSituationsScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={pageStyle.content}>
      <ScreenBanner height={140} title={lifeTitle(t)} />

      <Animated.View entering={FadeInUp.duration(450)}>
        <AppText variant="body" color={colors.muted} align="center" style={styles.intro}>
          {lifeIntro(t)}
        </AppText>
      </Animated.View>

      <Card padding={0} style={styles.list}>
        {lifeSituations.map((def, index) => (
          <SituationRow
            key={def.key}
            def={def}
            index={index}
            label={situationLabel(t, def.key)}
            last={index === lifeSituations.length - 1}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingHorizontal: spacing.lg,
  },
  list: {
    marginTop: spacing.xl,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  rowPressed: {
    backgroundColor: colors.surfaceTint,
  },
  label: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginLeft: spacing.lg + 40 + spacing.md + 2,
  },
});
