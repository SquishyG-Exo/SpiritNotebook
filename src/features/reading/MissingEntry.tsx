import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { AppText, Button, IconCircle } from '../../ui';
import { goHome } from './navigation';

/** Shown for unknown ids, e.g. a draft link reopened after a refresh. */
export function MissingEntry() {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.root}>
      <IconCircle name="Feather" size={72} tint={colors.lavenderSoft} color={colors.lavenderDeep} />
      <AppText variant="title" align="center">
        {t('reading.missing.title')}
      </AppText>
      <AppText variant="body" color={colors.muted} align="center">
        {t('reading.missing.body')}
      </AppText>
      <View style={styles.action}>
        <Button label={t('reading.missing.action')} onPress={goHome} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
