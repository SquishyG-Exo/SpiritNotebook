import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { glass, glassBlur } from './glass';

/** Looks like the search field; opens Search. */
export function SearchPill({ label }: { label: string }) {
  return (
    <PressableScale
      onPress={() => router.push('/search')}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID="notebook-search"
      style={[glass.firm, glassBlur, styles.pill]}>
      <View>
        <Icon name="Search" size={20} color={colors.plumDeep} strokeWidth={1.9} />
      </View>
      <AppText style={styles.placeholder} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 50,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg + 2,
  },
  placeholder: { flex: 1, fontFamily: fonts.body, fontSize: 16, lineHeight: 20, color: colors.muted },
});
