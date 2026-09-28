import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { brand } from '../../brand/config';
import { i18n } from '../i18n';
import { readStorage, writeStorage } from '../lib/storage';
import type { Language } from './types';

const LANGUAGE_KEY = 'spirit.language';
const ADVISOR_KEY = 'spirit.advisorMode';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (brand.languages as readonly string[]).includes(value);
}

/** Stored preference → device locale → brand default. */
export function detectLanguage(): Language {
  const stored = readStorage(LANGUAGE_KEY);
  if (isLanguage(stored)) return stored;
  try {
    const device = getLocales()[0]?.languageCode;
    if (isLanguage(device)) return device;
  } catch {
    /* no locale info available */
  }
  return brand.defaultLanguage;
}

export interface SettingsContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Passcode gate state for this device. */
  unlocked: boolean;
  setUnlocked: (unlocked: boolean) => void;
  /** Lab setting: new readings consult the advisor model. */
  advisorMode: boolean;
  setAdvisorMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());
  const [unlocked, setUnlocked] = useState(false);
  const [advisorMode, setAdvisorModeState] = useState(() => readStorage(ADVISOR_KEY) === 'true');

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writeStorage(LANGUAGE_KEY, next);
  }, []);

  const setAdvisorMode = useCallback((enabled: boolean) => {
    setAdvisorModeState(enabled);
    writeStorage(ADVISOR_KEY, enabled ? 'true' : null);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, unlocked, setUnlocked, advisorMode, setAdvisorMode }),
    [language, setLanguage, unlocked, advisorMode, setAdvisorMode],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
