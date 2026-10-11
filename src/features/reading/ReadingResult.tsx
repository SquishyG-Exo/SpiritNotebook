import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { formatDate, formatTime } from '../../lib/dates';
import { useSettings, type EntryContent, type JournalEntry, type Reading } from '../../state';
import { colors, spacing, withAlpha } from '../../theme';
import { AppText, Button, HitSlopArea, Icon } from '../../ui';
import { glass, glassBlur } from '../entry/scenery';
import { EntryQuote } from './EntryQuote';
import { NoteEditor } from './NoteEditor';
import { splitParagraphs } from './paragraphs';
import { PhotoChip, ReadingBanner } from './ReadingBanner';
import { readingEyebrow } from './readingCopy';

const enter = (step: number) => FadeInUp.delay(60 + step * 90).duration(550);

export interface ReadingResultProps {
  entry: JournalEntry;
  /** The entry's content in the current language. */
  content: EntryContent;
  reading: Reading;
  note?: string;
  /** Draft only: save, optionally with a note, then leave. */
  onSave: (note?: string) => void;
  /** Saved entries: add, edit or clear the note in place. */
  onUpdateNote: (note: string) => void;
}

/** "Oct 11, 2026 · 9:41 AM"; the time only when the reader gave one. */
export function useEntryDateLine(entry: JournalEntry): string {
  const { t } = useTranslation();
  const { language } = useSettings();
  const when = new Date(entry.createdAt);
  const date = formatDate(when, language);
  return entry.hasTime ? t('reading.dateTime', { date, time: formatTime(when, language) }) : date;
}

function DraftActions({ onSave }: { onSave: (note?: string) => void }) {
  const { t } = useTranslation();
  const [journaling, setJournaling] = useState(false);

  if (journaling) {
    return (
      <NoteEditor
        submitLabel={t('reading.saveWithNote')}
        onSubmit={(note) => onSave(note)}
        onCancel={() => setJournaling(false)}
      />
    );
  }

  return (
    <View style={styles.actions}>
      <Button
        label={t('reading.save')}
        onPress={() => onSave()}
        icon={<Icon name="BookmarkPlus" size={19} color={colors.white} />}
        testID="reading-save"
      />
      <Button
        variant="light"
        label={t('reading.journal')}
        onPress={() => setJournaling(true)}
        icon={<Icon name="PenLine" size={18} color={colors.plum} />}
        testID="reading-journal"
      />
    </View>
  );
}

function SavedThoughts({ note, onUpdateNote }: { note?: string; onUpdateNote: (note: string) => void }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <NoteEditor
        initialValue={note}
        submitLabel={t('reading.saveThought')}
        requireText={!note}
        onSubmit={(next) => {
          onUpdateNote(next);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (note) {
    return (
      <View style={[glass.card, glassBlur, styles.thoughts]}>
        <View style={styles.thoughtsHeader}>
          <View style={styles.inline}>
            <Icon name="PenLine" size={15} color={colors.gold} />
            <AppText variant="overline" color={colors.goldDeep}>
              {t('reading.myThoughts')}
            </AppText>
          </View>
          <Pressable
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => (pressed ? styles.pressed : null)}>
            <HitSlopArea hitSlop={10} />
            <AppText variant="smallMedium" color={colors.plum}>
              {t('reading.editThought')}
            </AppText>
          </Pressable>
        </View>
        <AppText variant="quote" color={colors.ink} style={[styles.note, glass.lining]}>
          {note}
        </AppText>
      </View>
    );
  }

  return (
    <Button
      variant="light"
      label={t('reading.addThought')}
      onPress={() => setEditing(true)}
      icon={<Icon name="PenLine" size={18} color={colors.plum} />}
      testID="reading-add-thought"
    />
  );
}

/**
 * A finished reading: the entry's painting, the reader's own title, the
 * reading, its reflection question, then save / journal actions (drafts) or
 * the reader's words and thoughts (saved entries).
 */
export function ReadingResult({ entry, content, reading, note, onSave, onUpdateNote }: ReadingResultProps) {
  const { t } = useTranslation();
  const isDraft = entry.status === 'draft';
  const paragraphs = splitParagraphs(reading.interpretation);
  const ownTitle = content.title?.trim();
  const dateLine = useEntryDateLine(entry);

  return (
    <View style={styles.root}>
      <Animated.View entering={enter(0)}>
        <ReadingBanner
          entry={entry}
          extra={reading.advisor?.consulted ? <PhotoChip icon="Sparkles" label={t('reading.advisorChip')} /> : null}
        />
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.heading}>
        <AppText variant="title" color={colors.plum} accessibilityRole="header" style={glass.lining} testID="reading-heading">
          {ownTitle || reading.title}
        </AppText>
        <View style={styles.inline}>
          <Icon name={entry.hasTime ? 'Clock' : 'CalendarDays'} size={14} color={colors.gold} strokeWidth={2} />
          <AppText variant="caption" color={colors.muted} testID="reading-date">
            {dateLine}
          </AppText>
        </View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={[glass.solid, glassBlur, styles.reading]}>
        <AppText variant="overline" color={colors.goldDeep}>
          {readingEyebrow(t, entry.category)}
        </AppText>
        {ownTitle ? (
          <AppText variant="heading" color={colors.ink} style={glass.lining} testID="reading-title">
            {reading.title}
          </AppText>
        ) : null}
        <View style={styles.paragraphs}>
          {paragraphs.map((paragraph, index) => (
            <AppText key={index} variant="body" color={colors.inkSoft}>
              {paragraph}
            </AppText>
          ))}
        </View>
      </Animated.View>

      {reading.reflectionQuestion ? (
        <Animated.View entering={enter(3)} style={[glass.card, glassBlur, styles.reflection]}>
          <View style={styles.inline}>
            <Icon name="Sparkles" size={15} color={colors.gold} />
            <AppText variant="overline" color={colors.goldDeep}>
              {t('reading.reflection')}
            </AppText>
          </View>
          <AppText variant="quote" color={colors.plum} style={[styles.question, glass.lining]}>
            {reading.reflectionQuestion}
          </AppText>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(4)} style={styles.after}>
        {isDraft ? (
          <DraftActions onSave={onSave} />
        ) : (
          <>
            {/* The banner already carries the photo chip. */}
            <EntryQuote text={content.text} title={ownTitle} />
            <SavedThoughts note={note} onUpdateNote={onUpdateNote} />
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
    paddingTop: spacing.xs,
  },
  heading: {
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
  },
  reading: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  paragraphs: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  reflection: {
    padding: spacing.xl,
    backgroundColor: withAlpha(colors.lavenderSoft, 0.82),
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  question: {
    marginTop: spacing.sm + 2,
  },
  after: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  thoughts: {
    padding: spacing.xl,
  },
  thoughtsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  note: {
    marginTop: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
