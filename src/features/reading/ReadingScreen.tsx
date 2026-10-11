import { useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { categoryByKey } from '../../../brand/categories';
import { resolveContent, useJournal, useSettings, type JournalEntry } from '../../state';
import { colors, layout } from '../../theme';
import { GlassIconButton, goBackOrHome, Screen, useLightStatusBar } from '../../ui';
import { firstParam } from '../entry/params';
import { SkyBackground, TopBar } from '../entry/scenery';
import { CareResult } from './CareResult';
import { EntryQuote } from './EntryQuote';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { MissingEntry } from './MissingEntry';
import { goHome, openInCalendar } from './navigation';
import { displayNote } from './paragraphs';
import { readingScreenTitle } from './readingCopy';
import { ReadingResult } from './ReadingResult';
import { useInterpretation } from './useInterpretation';

/**
 * /entry/[id]: a draft's reading as it arrives (loading, error, care or
 * result), or a saved entry. Leaving an unsaved draft discards it.
 */
export function ReadingScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = firstParam(params.id);
  const { getEntry, saveEntry, discardDraft, updateNote, toggleFavorite } = useJournal();
  const { language } = useSettings();

  const live = id ? getEntry(id) : undefined;
  // Keep rendering the draft we are discarding while the screen animates away.
  const [leavingWith, setLeavingWith] = useState<JournalEntry | null>(null);
  const entry = live ?? leavingWith ?? undefined;
  const { error, retry } = useInterpretation(live, language);
  const content = entry ? resolveContent(entry, language) : undefined;
  const reading = content?.reading;
  const isCare = reading?.kind === 'care';
  // Cream text on the violet band; the care path stays plain, with dark status bar text.
  useLightStatusBar(!isCare);

  /** Leaving an unsaved draft discards it. */
  const leave = (then: () => void) => {
    if (live?.status === 'draft') {
      setLeavingWith(live);
      discardDraft(live.id);
    }
    then();
  };
  const back = () => leave(goBackOrHome);

  if (!entry || !content) {
    return (
      <View style={styles.fill}>
        <SkyBackground band />
        <Screen background="transparent" edges={['top', 'bottom']} contentStyle={styles.content}>
          <TopBar onBack={back} backLabel={t('common.actions.back')} title={t('reading.title')} tone="band" />
          <MissingEntry />
        </Screen>
      </View>
    );
  }

  const def = categoryByKey(entry.category);
  // Favorites: saved entries, and drafts once their reading is in (saving keeps the heart).
  const canFavorite = !!live && !isCare && (live.status === 'saved' || !!reading);
  const favorite = !!entry.favorite;

  const toggleHeart = () => {
    toggleFavorite(entry.id);
    AccessibilityInfo.announceForAccessibility(favorite ? t('reading.favorite.removed') : t('reading.favorite.added'));
  };

  const save = (note?: string) => {
    saveEntry(entry.id, note ? { note } : undefined);
    // Show the day the entry belongs to (today unless the reader picked an earlier day).
    openInCalendar(entry.id, new Date(entry.createdAt));
  };

  let body: ReactNode;
  if (isCare && reading) {
    body = <CareResult reading={reading} onHome={() => leave(goHome)} />;
  } else if (reading) {
    body = (
      <ReadingResult
        entry={entry}
        content={content}
        reading={reading}
        note={displayNote(entry, content)}
        onSave={save}
        onUpdateNote={(note) => updateNote(entry.id, note)}
      />
    );
  } else if (error) {
    body = (
      <ErrorState
        error={error}
        category={entry.category}
        text={content.text}
        title={content.title}
        hasPhoto={entry.hasPhoto}
        onRetry={retry}
        onBack={back}
      />
    );
  } else if (entry.status === 'draft') {
    body = (
      <LoadingState
        category={entry.category}
        icon={def.icon}
        text={content.text}
        title={content.title}
        hasPhoto={entry.hasPhoto}
      />
    );
  } else {
    body = <EntryQuote text={content.text} title={content.title} hasPhoto={entry.hasPhoto} />;
  }

  const heart = canFavorite ? (
    <GlassIconButton
      icon="Heart"
      label={favorite ? t('reading.favorite.remove') : t('reading.favorite.add')}
      onPress={toggleHeart}
      iconColor={favorite ? colors.roseDeep : colors.plum}
      fill={favorite ? colors.roseDeep : undefined}
      selected={favorite}
      testID="reading-favorite"
    />
  ) : null;

  return (
    <View style={styles.fill}>
      {/* The care path stays plain and calm: no painting behind it. */}
      {isCare ? null : <SkyBackground band veil={reading ? 0.12 : 0} />}
      <Screen
        scroll
        background={isCare ? colors.cream : 'transparent'}
        edges={['top', 'bottom']}
        contentStyle={styles.content}>
        <TopBar
          onBack={back}
          backLabel={t('common.actions.back')}
          // The care message speaks for itself: no "interpretation" title over it.
          title={isCare ? undefined : readingScreenTitle(t, entry.category)}
          right={heart}
          tone={isCare ? 'sky' : 'band'}
        />
        {body}
      </Screen>
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
});
