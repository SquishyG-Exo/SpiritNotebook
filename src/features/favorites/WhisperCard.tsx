import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import type { Whisper } from '../../../brand/whispers';
import { useSettings } from '../../state';
import { colors, fonts, spacing, withAlpha } from '../../theme';
import { AppText, Icon, PressableScale } from '../../ui';
import { glass, glassBlur } from '../notebook/glass';
import { HeartButton } from '../notebook/HeartButton';

export interface WhisperCardProps {
  whisper: Whisper;
  index: number;
  onUnsave: () => void;
}

/**
 * A saved whisper: the words in Cormorant italic and, when it echoes a
 * teacher, "In the spirit of …". Never styled as a quotation (no quote
 * marks): whispers are original writing. Opens it on Whispers of Wisdom.
 */
export function WhisperCard({ whisper, index, onUnsave }: WhisperCardProps) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const text = whisper.text[language] ?? whisper.text.en;
  const spirit = whisper.inspiredBy ? t('favorites.inSpiritOf', { author: whisper.inspiredBy.author }) : undefined;

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 6) * 50)} exiting={FadeOut.duration(180)}>
      <PressableScale
        onPress={() => router.push({ pathname: '/whispers', params: { id: whisper.id } })}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={[text, spirit].filter(Boolean).join('. ')}
        accessibilityHint={t('favorites.openWhisper')}
        testID={`whisper-${whisper.id}`}
        style={[glass.card, glassBlur, styles.card]}>
        <View style={styles.top}>
          <View style={styles.badge}>
            <Icon name="Sun" size={18} color={colors.gold} strokeWidth={1.7} />
          </View>
          <HeartButton label={t('favorites.unsaveWhisper')} onPress={onUnsave} testID={`unsave-${whisper.id}`} />
        </View>
        <AppText style={styles.text}>{text}</AppText>
        {spirit ? <AppText style={styles.spirit}>{spirit}</AppText> : null}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.goldLight, 0.3),
  },
  text: {
    fontFamily: fonts.displayItalic,
    fontSize: 21,
    lineHeight: 29,
    color: colors.plumDeep,
  },
  spirit: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.goldDeep,
  },
});
