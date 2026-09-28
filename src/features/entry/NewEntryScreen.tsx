import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { categoryByKey } from '../../../brand/categories';
import { brand } from '../../../brand/config';
import { useJournal } from '../../state';
import { colors, spacing } from '../../theme';
import { Button, Icon, Screen } from '../../ui';
import { categoryPlaceholder, situationColors, situationPlaceholder } from '../explore/categoryCopy';
import { ScreenBanner } from '../explore/ScreenBanner';
import { EntryInput } from './EntryInput';
import { HintsCard } from './HintsCard';
import { parseComposerTopic } from './params';
import { PhotoAttachment } from './PhotoAttachment';
import { TopicRow } from './TopicRow';
import { pageStyle } from '../explore/pageStyle';

const enter = (delay: number) => FadeInUp.delay(delay).duration(450);

export function NewEntryScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ category?: string | string[]; subcategory?: string | string[] }>();
  const { category, subcategory } = parseComposerTopic(params.category, params.subcategory);
  const palette = subcategory ? situationColors(subcategory) : categoryByKey(category);
  const { createDraft } = useJournal();

  const [text, setText] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const canInterpret = text.trim().length >= brand.ai.minInputChars;

  const placeholder = subcategory ? situationPlaceholder(t, subcategory) : categoryPlaceholder(t, category);

  // One draft per tap: ignore a quick second tap; re-arm when the composer is shown again.
  const submittedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      submittedRef.current = false;
    }, []),
  );

  const interpret = () => {
    if (!canInterpret || submittedRef.current) return;
    submittedRef.current = true;
    const draft = createDraft({ text, category, subcategory, hasPhoto });
    router.push(`/entry/${draft.id}`);
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll edges={['top', 'bottom']} contentStyle={pageStyle.content}>
        {/* Calm art: no butterflies or sparkles above the composer. */}
        <ScreenBanner height={110} title={t('entry.title')} butterflies="none" sparkles={false} />

        <View style={styles.stack}>
          <Animated.View entering={enter(40)}>
            <TopicRow category={category} subcategory={subcategory} />
          </Animated.View>

          <Animated.View entering={enter(120)}>
            <HintsCard category={category} tint={palette.tint} accent={palette.accent} />
          </Animated.View>

          <Animated.View entering={enter(200)}>
            <EntryInput value={text} onChangeText={setText} placeholder={placeholder} />
          </Animated.View>

          <Animated.View entering={enter(280)}>
            <PhotoAttachment hasPhoto={hasPhoto} onChange={setHasPhoto} />
          </Animated.View>

          <Animated.View entering={enter(360)} style={styles.action}>
            <Button
              label={t('entry.interpret')}
              onPress={interpret}
              disabled={!canInterpret}
              icon={<Icon name="Sparkles" size={18} color={colors.white} />}
              testID="entry-interpret"
            />
          </Animated.View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  stack: {
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  action: {
    marginTop: spacing.xs,
  },
});
