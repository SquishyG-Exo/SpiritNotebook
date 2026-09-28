import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { categoryByKey } from '../../../brand/categories';
import { formatDate } from '../../lib/dates';
import { useSettings, type JournalEntry, type Reading } from '../../state';
import { colors, spacing } from '../../theme';
import { AppText, Button, Card, Chip, Icon } from '../../ui';
import { entryTopicLabel } from '../../lib/categoryCopy';
import { EntryQuote } from './EntryQuote';
import { NoteEditor } from './NoteEditor';
import { splitParagraphs } from './paragraphs';
import { ReadingBanner } from './ReadingBanner';

const enter = (step: number) => FadeInUp.delay(60 + step * 90).duration(550);

export interface ReadingResultProps {
  entry: JournalEntry;
  text: string;
  reading: Reading;
  note?: string;
  /** Draft only: save, optionally with a note, then leave. */
  onSave: (note?: string) => void;
  /** Saved entries: add, edit or clear the note in place. */
  onUpdateNote: (note: string) => void;
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
        variant="secondary"
        label={t('reading.journal')}
        onPress={() => setJournaling(true)}
        icon={<Icon name="PenLine" size={18} color={colors.roseDeep} />}
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
      <Card>
        <View style={styles.thoughtsHeader}>
          <View style={styles.inline}>
            <Icon name="PenLine" size={15} color={colors.roseDeep} />
            <AppText variant="overline" color={colors.roseDeep}>
              {t('reading.myThoughts')}
            </AppText>
          </View>
          <Pressable
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => (pressed ? styles.pressed : null)}>
            <AppText variant="smallMedium" color={colors.roseDeep}>
              {t('reading.editThought')}
            </AppText>
          </Pressable>
        </View>
        <AppText variant="quote" color={colors.ink} style={styles.note}>
          {note}
        </AppText>
      </Card>
    );
  }

  return (
    <Button
      variant="ghost"
      label={t('reading.addThought')}
      onPress={() => setEditing(true)}
      icon={<Icon name="PenLine" size={18} color={colors.inkSoft} />}
      testID="reading-add-thought"
    />
  );
}

/** A finished reading: banner, title, interpretation, reflection, then save or journal actions. */
export function ReadingResult({ entry, text, reading, note, onSave, onUpdateNote }: ReadingResultProps) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const def = categoryByKey(entry.category);
  const isDraft = entry.status === 'draft';
  const paragraphs = splitParagraphs(reading.interpretation);

  return (
    <View style={styles.root}>
      <Animated.View entering={enter(0)} style={styles.meta}>
        <View style={styles.chips}>
          <Chip
            label={entryTopicLabel(t, entry.category, entry.subcategory)}
            background={def.tint}
            color={def.accent}
            icon={<Icon name={def.icon} size={14} color={def.accent} strokeWidth={2} />}
          />
          {entry.isSample ? <Chip label={t('common.sample')} tone="lavender" /> : null}
        </View>
        <AppText variant="caption" color={colors.muted}>
          {formatDate(new Date(entry.createdAt), language)}
        </AppText>
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <ReadingBanner def={def} hasPhoto={entry.hasPhoto} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.body}>
        <AppText variant="title">{reading.title}</AppText>
        {paragraphs.map((paragraph, index) => (
          <AppText key={index} variant="body" color={colors.inkSoft}>
            {paragraph}
          </AppText>
        ))}
      </Animated.View>

      {reading.reflectionQuestion ? (
        <Animated.View entering={enter(3)}>
          <Card tint={colors.lavenderSoft} elevated={false} style={styles.reflection}>
            <View style={styles.inline}>
              <Icon name="Sparkles" size={15} color={colors.lavenderDeep} />
              <AppText variant="overline" color={colors.lavenderDeep}>
                {t('reading.reflection')}
              </AppText>
            </View>
            <AppText variant="quote" color={colors.ink} style={styles.question}>
              {reading.reflectionQuestion}
            </AppText>
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(4)} style={styles.after}>
        {isDraft ? (
          <DraftActions onSave={onSave} />
        ) : (
          <>
            {/* The banner already carries the photo badge. */}
            <EntryQuote text={text} />
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
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flexShrink: 1,
  },
  body: {
    gap: spacing.md,
  },
  reflection: {
    borderColor: colors.lavenderSoft,
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
