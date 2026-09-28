import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { brand } from '../../brand/config';
import type { Language } from '../state/types';
import { resources } from './resources';

/** The app's i18next instance. Use react-i18next's useTranslation() in components. */
export const i18n = createInstance();

/** Idempotent, synchronous setup (resources are bundled). */
export function initI18n(language: Language = brand.defaultLanguage): typeof i18n {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: brand.defaultLanguage,
      interpolation: { escapeValue: false },
      returnNull: false,
      initAsync: false,
    });
  }
  return i18n;
}
