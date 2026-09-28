import { useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { categoryByKey } from '../../../brand/categories';
import { resolveContent, useJournal, useSettings, type JournalEntry } from '../../state';
import { goBackOrHome, Header, Screen } from '../../ui';
import { firstParam } from '../entry/params';
import { CareResult } from './CareResult';
import { EntryQuote } from './EntryQuote';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { MissingEntry } from './MissingEntry';
import { goHome, openInCalendar } from './navigation';
import { displayNote } from './paragraphs';
import { ReadingResult } from './ReadingResult';
import { useInterpretation } from './useInterpretation';
import { pageStyle } from '../explore/pageStyle';

export function ReadingScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = firstParam(params.id);
  const { getEntry, saveEntry, discardDraft, updateNote } = useJournal();
  const { language } = useSettings();

  const live = id ? getEntry(id) : undefined;
  // Keep rendering the draft we are discarding while the screen animates away.
  const [leavingWith, setLeavingWith] = useState<JournalEntry | null>(null);
  const entry = live ?? leavingWith ?? undefined;
  const { error, retry } = useInterpretation(live, language);

  /** Leaving an unsaved draft discards it. */
  const leave = (then: () => void) => {
    if (live?.status === 'draft') {
      setLeavingWith(live);
      discardDraft(live.id);
    }
    then();
  };
  const back = () => leave(goBackOrHome);

  const header = <Header title={t('reading.title')} onBack={back} backLabel={t('common.actions.back')} />;

  if (!entry) {
    return (
      <Screen edges={['top', 'bottom']}>
        {header}
        <MissingEntry />
      </Screen>
    );
  }

  const content = resolveContent(entry, language);
  const reading = content.reading;
  const def = categoryByKey(entry.category);

  const save = (note?: string) => {
    const savedAt = new Date();
    saveEntry(entry.id, note ? { note } : undefined);
    openInCalendar(entry.id, savedAt);
  };

  let body: ReactNode;
  if (reading?.kind === 'care') {
    body = <CareResult reading={reading} onHome={() => leave(goHome)} />;
  } else if (reading) {
    body = (
      <ReadingResult
        entry={entry}
        text={content.text}
        reading={reading}
        note={displayNote(entry, content)}
        onSave={save}
        onUpdateNote={(note) => updateNote(entry.id, note)}
      />
    );
  } else if (error) {
    body = (
      <ErrorState error={error} text={content.text} hasPhoto={entry.hasPhoto} onRetry={retry} onBack={back} />
    );
  } else if (entry.status === 'draft') {
    body = <LoadingState icon={def.icon} text={content.text} hasPhoto={entry.hasPhoto} />;
  } else {
    body = <EntryQuote text={content.text} hasPhoto={entry.hasPhoto} />;
  }

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={pageStyle.content}>
      {header}
      {body}
    </Screen>
  );
}
