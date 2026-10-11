import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View, type TextInput } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { brand } from '../../../brand/config';
import { categoryPlaceholder, categoryTitlePlaceholder, situationPlaceholder } from '../../lib/categoryCopy';
import { dateKey, isSameDay, startOfDay } from '../../lib/dates';
import { useJournal, useSettings } from '../../state';
import { colors, fonts, layout, spacing } from '../../theme';
import { AppText, Button, goBackOrHome, Icon, Screen } from '../../ui';
import { composerIntro, composerPrompt, submitLabel, tooShortHint } from './composerCopy';
import { DateSheet } from './DateSheet';
import { DetailsCard } from './DetailsCard';
import { EntryInput } from './EntryInput';
import { HintsCard } from './HintsCard';
import { firstParam, parseComposerTopic } from './params';
import { PhotoAttachment } from './PhotoAttachment';
import { glass, HEADER_TEXT, HEADER_TEXT_SOFT, SkyBackground, TopBar, useLightStatusBar } from './scenery';
import { TopicRow } from './TopicRow';
import { combineDayAndTime, parseDayParam, timeOf, type TimeOfDay } from './when';

const enter = (delay: number) => FadeInUp.delay(delay).duration(450);

type ComposerParams = {
  category?: string | string[];
  subcategory?: string | string[];
  /** 'YYYY-MM-DD': preselects the day (e.g. from the Calendar). Future days are ignored. */
  date?: string | string[];
};

/**
 * New entry: what happened, an optional title, the day (today or earlier) and
 * an optional time. Creates an unsaved draft and opens its reading.
 *
 * Route: /entry/new?category=&subcategory=&date=YYYY-MM-DD
 */
export function NewEntryScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<ComposerParams>();
  const { category, subcategory } = parseComposerTopic(params.category, params.subcategory);
  const { createDraft } = useJournal();
  const { language } = useSettings();
  useLightStatusBar();

  // "Now" is captured once so renders stay pure; the day defaults to today, or the `date` param.
  const [now] = useState(() => new Date());
  const [day, setDay] = useState(() => parseDayParam(firstParam(params.date), now) ?? startOfDay(now));
  // Today starts with the current time; an earlier day starts without one.
  const [time, setTime] = useState<TimeOfDay | null>(() => (isSameDay(day, now) ? timeOf(now) : null));
  const [timeTouched, setTimeTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [choosingDate, setChoosingDate] = useState(false);
  const textRef = useRef<TextInput>(null);

  const isToday = isSameDay(day, now);
  const canSubmit = text.trim().length >= brand.ai.minInputChars;
  const placeholder = subcategory ? situationPlaceholder(t, subcategory) : categoryPlaceholder(t, category);
  const intro = composerIntro(t, category);

  // One draft per tap: ignore a quick second tap; re-arm when the composer is shown again.
  const submittedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      submittedRef.current = false;
    }, []),
  );

  const openDate = () => {
    Keyboard.dismiss();
    setChoosingDate(true);
  };
  const closeDate = useCallback(() => setChoosingDate(false), []);

  const chooseDay = (next: Date) => {
    setDay(next);
    // Until the reader sets a time themselves, follow the default: a time for today, none for earlier days.
    if (!timeTouched) setTime(isSameDay(next, now) ? timeOf(new Date()) : null);
    setChoosingDate(false);
  };

  const toggleTime = () => {
    setTimeTouched(true);
    setTime((current) => (current ? null : timeOf(new Date())));
  };

  const changeTime = (next: TimeOfDay) => {
    setTimeTouched(true);
    setTime(next);
  };

  const submit = () => {
    if (!canSubmit || submittedRef.current) return;
    submittedRef.current = true;
    const draft = createDraft({
      text,
      title,
      category,
      subcategory,
      hasPhoto,
      date: combineDayAndTime(day, time),
      hasTime: time !== null,
    });
    router.push(`/entry/${draft.id}`);
  };

  return (
    <View style={styles.fill}>
      <SkyBackground band />
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen scroll background="transparent" edges={['top', 'bottom']} contentStyle={styles.content}>
          <TopBar onBack={goBackOrHome} backLabel={t('common.actions.back')} />

          <Animated.View entering={enter(0)} style={styles.heading}>
            <AppText
              variant="title"
              color={HEADER_TEXT}
              align="center"
              accessibilityRole="header"
              style={[styles.prompt, glass.headerShadow]}>
              {composerPrompt(t, category, isToday)}
            </AppText>
            {intro ? (
              <AppText color={HEADER_TEXT_SOFT} align="center" style={[styles.intro, glass.headerShadow]}>
                {intro}
              </AppText>
            ) : null}
          </Animated.View>

          <View style={styles.stack}>
            <Animated.View entering={enter(60)}>
              <TopicRow category={category} subcategory={subcategory} date={isToday ? undefined : dateKey(day)} />
            </Animated.View>

            <Animated.View entering={enter(120)}>
              <DetailsCard
                title={title}
                onChangeTitle={setTitle}
                titlePlaceholder={categoryTitlePlaceholder(t, category)}
                onSubmitTitle={() => textRef.current?.focus()}
                day={day}
                now={now}
                onOpenDate={openDate}
                time={time}
                onToggleTime={toggleTime}
                onChangeTime={changeTime}
                language={language}
              />
            </Animated.View>

            <Animated.View entering={enter(180)}>
              <EntryInput
                inputRef={textRef}
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                tooShortHint={tooShortHint(t, category)}
              />
            </Animated.View>

            <Animated.View entering={enter(240)}>
              <HintsCard category={category} />
            </Animated.View>

            <Animated.View entering={enter(300)}>
              <PhotoAttachment hasPhoto={hasPhoto} onChange={setHasPhoto} category={category} />
            </Animated.View>

            <Animated.View entering={enter(360)} style={styles.action}>
              <Button
                label={submitLabel(t, category)}
                onPress={submit}
                disabled={!canSubmit}
                icon={<Icon name="Sparkles" size={18} color={colors.white} />}
                testID="entry-interpret"
              />
            </Animated.View>
          </View>
        </Screen>
      </KeyboardAvoidingView>

      {choosingDate ? (
        <DateSheet value={day} now={now} language={language} onSelect={chooseDay} onClose={closeDate} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  heading: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.xl,
  },
  prompt: {
    fontSize: 32,
    lineHeight: 38,
    fontVariant: ['lining-nums'],
  },
  intro: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 330,
    marginTop: spacing.sm,
  },
  stack: {
    gap: spacing.lg,
  },
  action: {
    marginTop: spacing.xs,
  },
});
