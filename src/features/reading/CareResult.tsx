import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { brand } from '../../../brand/config';
import type { Reading } from '../../state';
import { colors, radius, spacing } from '../../theme';
import { AppText, Button, Icon } from '../../ui';
import { openExternal } from './navigation';
import { splitParagraphs } from './paragraphs';
import { CareBanner } from './ReadingBanner';

const enter = (step: number) => FadeInUp.delay(60 + step * 110).duration(600);

/**
 * When the guide senses distress it answers with care instead of a reading:
 * a calmer layout, the crisis line up front, no reflection and no save.
 */
export function CareResult({ reading, onHome }: { reading: Reading; onHome: () => void }) {
  const { t } = useTranslation();
  const paragraphs = splitParagraphs(reading.interpretation);
  const { tel, sms } = brand.links.crisisLine;

  return (
    <View style={styles.root}>
      <Animated.View entering={enter(0)} style={styles.panel}>
        <CareBanner fadeTo={colors.lavenderSoft} style={styles.art} />
        <AppText variant="overline" color={colors.roseDeep} style={styles.eyebrow}>
          {t('reading.care.eyebrow')}
        </AppText>
        <AppText variant="title">{reading.title}</AppText>
        <View style={styles.paragraphs}>
          {paragraphs.map((paragraph, index) => (
            <AppText key={index} variant="body" color={colors.inkSoft}>
              {paragraph}
            </AppText>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.support}>
        <AppText variant="small" color={colors.inkSoft} align="center">
          {t('reading.care.support')}
        </AppText>
        <Button
          label={t('reading.care.call')}
          onPress={() => openExternal(tel)}
          icon={<Icon name="Phone" size={18} color={colors.white} />}
          testID="care-call"
        />
        <Button
          variant="secondary"
          label={t('reading.care.text')}
          onPress={() => openExternal(sms)}
          icon={<Icon name="MessageSquare" size={18} color={colors.roseDeep} />}
          testID="care-text"
        />
        <AppText variant="small" color={colors.muted} align="center">
          {t('reading.care.outsideUs')}
        </AppText>
      </Animated.View>

      {reading.reflectionQuestion ? (
        <Animated.View entering={enter(2)}>
          <AppText variant="quote" color={colors.inkSoft} align="center" style={styles.closing}>
            {reading.reflectionQuestion}
          </AppText>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(3)} style={styles.footer}>
        <AppText variant="caption" color={colors.muted} align="center">
          {t('reading.care.disclaimer')}
        </AppText>
        <Button variant="ghost" label={t('reading.care.home')} onPress={onHome} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxl,
    paddingTop: spacing.xs,
  },
  panel: {
    backgroundColor: colors.lavenderSoft,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  // The dawn art runs edge to edge across the top of the panel and fades into it.
  art: {
    marginTop: -spacing.xxl,
    marginHorizontal: -spacing.xxl,
  },
  eyebrow: {
    marginTop: spacing.md,
  },
  paragraphs: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  support: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  closing: {
    fontSize: 17,
    lineHeight: 26,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
});
