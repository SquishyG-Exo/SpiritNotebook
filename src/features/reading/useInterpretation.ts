import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, requestInterpretation, type ApiErrorCode } from '../../api/client';
import { useJournal, useSettings, type JournalEntry, type Language } from '../../state';

export interface InterpretationError {
  code: ApiErrorCode;
  /** Seconds, when the server sent a rate-limit hint. */
  retryAfter?: number;
}

/**
 * Requests the AI reading for an unsaved draft, exactly once per attempt.
 *
 * A ref remembers which `${id}#${attempt}` was already sent, so React
 * StrictMode's double effect run (or any re-render) never fires a second
 * request; `retry()` bumps the attempt counter to send a fresh one.
 */
export function useInterpretation(entry: JournalEntry | undefined, language: Language) {
  const { setReading } = useJournal();
  const { advisorMode } = useSettings();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<InterpretationError | null>(null);
  const sentRef = useRef<string | null>(null);

  // The response can land after other journal updates: always write through the latest setter.
  const setReadingRef = useRef(setReading);
  useEffect(() => {
    setReadingRef.current = setReading;
  }, [setReading]);

  const id = entry?.id;
  const pending = !!entry && entry.status === 'draft' && !entry.content.reading;
  const text = entry?.content.text ?? '';
  const category = entry?.category;
  const subcategory = entry?.subcategory;

  useEffect(() => {
    if (!pending || !id || !category) return;
    const token = `${id}#${attempt}`;
    if (sentRef.current === token) return;
    sentRef.current = token;

    requestInterpretation({
      text,
      category,
      subcategory,
      language,
      mode: advisorMode ? 'advisor' : 'standard',
    })
      .then((reading) => setReadingRef.current(id, reading))
      .catch((cause: unknown) => {
        setError(
          cause instanceof ApiError
            ? { code: cause.code, retryAfter: cause.retryAfter }
            : { code: 'unknown' },
        );
      });
  }, [pending, id, attempt, text, category, subcategory, language, advisorMode]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { pending, error, retry };
}
