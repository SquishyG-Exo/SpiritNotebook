import type { TFunction } from 'i18next';

import type { CategoryKey } from '../../../brand/categories';

/**
 * Daily Gratitude comes back as a warm reflection rather than an
 * interpretation, so its screen copy differs (brand/locales/<lang>/reading.json).
 */
const isGratitude = (category: CategoryKey) => category === 'gratitude';

export function readingScreenTitle(t: TFunction, category: CategoryKey): string {
  return isGratitude(category) ? t('reading.titleGratitude') : t('reading.title');
}

/** Small label above the AI's own title. */
export function readingEyebrow(t: TFunction, category: CategoryKey): string {
  return isGratitude(category) ? t('reading.eyebrowGratitude') : t('reading.eyebrow');
}

export function loadingPhrases(t: TFunction, category: CategoryKey): string[] {
  const value: unknown = t(isGratitude(category) ? 'reading.loadingGratitude' : 'reading.loading', {
    returnObjects: true,
  });
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function errorTitle(t: TFunction, category: CategoryKey): string {
  return isGratitude(category) ? t('reading.error.titleGratitude') : t('reading.error.title');
}
