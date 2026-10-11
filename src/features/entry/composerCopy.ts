import type { TFunction } from 'i18next';

import type { CategoryKey } from '../../../brand/categories';

/**
 * Composer copy that changes with the category (brand/locales/<lang>/entry.json):
 *   entry.prompt.<category>   the question at the top of the page
 *   entry.intro.<category>    one gentle line under it
 * Daily Gratitude reads as a reflection, not an interpretation, so it gets its
 * own button and hint copy.
 */
export function composerPrompt(t: TFunction, category: CategoryKey, isToday: boolean): string {
  if (category === 'gratitude' && !isToday) return t('entry.prompt.gratitudePast');
  return t(`entry.prompt.${category}`, { defaultValue: t('entry.title') });
}

export function composerIntro(t: TFunction, category: CategoryKey): string {
  return t(`entry.intro.${category}`, { defaultValue: '' });
}

export function submitLabel(t: TFunction, category: CategoryKey): string {
  return category === 'gratitude' ? t('entry.interpretGratitude') : t('entry.interpret');
}

export function tooShortHint(t: TFunction, category: CategoryKey): string {
  return category === 'gratitude' ? t('entry.tooShortGratitude') : t('entry.tooShort');
}
