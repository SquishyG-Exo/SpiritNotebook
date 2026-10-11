import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import type { CategoryKey } from '../../../brand/categories';
import { colors, spacing } from '../../theme';
import { AppText, Button, Icon, IconCircle } from '../../ui';
import { glass, glassBlur } from '../entry/scenery';
import { EntryQuote } from './EntryQuote';
import { errorMessage, isDailyLimit } from './errorCopy';
import { errorTitle } from './readingCopy';
import type { InterpretationError } from './useInterpretation';

export interface ErrorStateProps {
  error: InterpretationError;
  category: CategoryKey;
  text: string;
  title?: string;
  hasPhoto?: boolean;
  onRetry: () => void;
  onBack: () => void;
}

/** Counts a rate-limit hint down to zero, one second at a time. */
function useCountdown(seconds: number | undefined) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil(seconds ?? 0)));
  const active = remaining > 0;
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return remaining;
}

export function ErrorState({ error, category, text, title, hasPhoto, onRetry, onBack }: ErrorStateProps) {
  const { t } = useTranslation();
  const daily = isDailyLimit(error);
  // Only a short burst limit gets a live countdown; a daily cap just says "come back tomorrow".
  const remaining = useCountdown(error.code === 'rate_limited' && !daily ? error.retryAfter : undefined);

  const wait =
    remaining > 90
      ? t('reading.error.retryInMinutes', { count: Math.ceil(remaining / 60) })
      : t('reading.error.retryIn', { count: remaining });

  return (
    <View style={styles.root} testID="reading-error">
      <Animated.View entering={FadeInUp.duration(450)} style={[glass.solid, glassBlur, styles.card]}>
        <IconCircle name="CircleAlert" size={52} tint={colors.roseSoft} color={colors.roseDeep} />
        <AppText variant="heading" color={colors.plum} align="center">
          {errorTitle(t, category)}
        </AppText>
        <AppText variant="body" color={colors.inkSoft} align="center">
          {errorMessage(t, error)}
        </AppText>
        {remaining > 0 ? (
          <AppText variant="caption" color={colors.muted} align="center" accessibilityLiveRegion="polite">
            {wait}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          {daily ? (
            <Button variant="light" label={t('common.actions.back')} onPress={onBack} />
          ) : (
            <>
              <Button
                label={t('common.actions.retry')}
                onPress={onRetry}
                disabled={remaining > 0}
                icon={<Icon name="RotateCcw" size={18} color={colors.white} />}
                testID="reading-retry"
              />
              <Button variant="ghost" label={t('common.actions.back')} onPress={onBack} />
            </>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(150).duration(450)}>
        <EntryQuote text={text} title={title} hasPhoto={hasPhoto} maxLines={6} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
