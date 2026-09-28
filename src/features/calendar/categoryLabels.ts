import type { TFunction } from 'i18next';

import type { CategoryKey, LifeSituationKey } from '../../../brand/categories';
import type { JournalEntry } from '../../state';

/**
 * English fallbacks for the category contract (brand/locales/<lang>/categories.json).
 * Passed as defaultValue so a missing or not-yet-written key never renders raw.
 */
const CATEGORY_FALLBACK: Record<CategoryKey, string> = {
  dreams: 'Dreams',
  numbers: 'Numbers',
  signs: 'Signs & Symbols',
  life: 'Life Situations',
  people: 'People',
  places: 'Places & Travel',
  words: 'Repeated Words',
  animals: 'Animals',
  objects: 'Objects',
  body: 'Body Signs',
  questions: 'Spiritual Questions',
  synchronicities: 'Synchronicities',
};

const SITUATION_FALLBACK: Record<LifeSituationKey, string> = {
  love: 'Love & Relationships',
  breakups: 'Breakups & Separation',
  family: 'Family',
  friendships: 'Friendships',
  career: 'Career & Purpose',
  money: 'Money & Abundance',
  home: 'Home & Changes',
  travel: 'Travel & New Beginnings',
  endings: 'Endings & Transitions',
  decisions: 'Important Decisions',
  encounters: 'Unexpected Encounters',
  growth: 'Personal Growth',
  loss: 'Loss & Letting Go',
  repeated: 'Repeated Situations',
  unexplained: 'Something I Can’t Explain',
};

/** Title-cases an unknown key, e.g. 'new_thing' → 'New thing'. */
function humanize(key: string): string {
  const words = key.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function categoryLabel(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.label`, { defaultValue: CATEGORY_FALLBACK[key] ?? humanize(key) });
}

export function situationLabel(t: TFunction, key: LifeSituationKey): string {
  return t(`categories.situations.${key}.label`, {
    defaultValue: SITUATION_FALLBACK[key] ?? humanize(key),
  });
}

/** The most specific label for an entry: the life situation when there is one. */
export function entryCategoryLabel(t: TFunction, entry: Pick<JournalEntry, 'category' | 'subcategory'>): string {
  return entry.category === 'life' && entry.subcategory
    ? situationLabel(t, entry.subcategory)
    : categoryLabel(t, entry.category);
}
