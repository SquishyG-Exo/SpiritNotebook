/**
 * Category copy with safe fallbacks.
 *
 * Labels, hints and placeholders live in brand/locales/<lang>/categories.json.
 * Every lookup passes a defaultValue so a screen never shows a raw key, even
 * while that file is incomplete. The fallbacks are English on purpose: they
 * are a safety net, not a translation.
 */
import type { TFunction } from 'i18next';

import {
  categoryByKey,
  type CategoryDef,
  type CategoryKey,
  type LifeSituationKey,
} from '../../brand/categories';
import type { JournalEntry } from '../state/types';

const LABELS: Record<CategoryKey, string> = {
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

const PLACEHOLDERS: Record<CategoryKey, string> = {
  dreams: 'Describe your dream: the places, people and feelings you remember…',
  numbers: 'Which numbers keep appearing, and where do you notice them?',
  signs: 'What sign or symbol did you notice, and where?',
  life: 'What is happening in your life right now?',
  people: 'Who crossed your path, and what happened?',
  places: 'Where were you, and what did the place stir in you?',
  words: 'Which words or phrases keep finding you?',
  animals: 'Which animal appeared, and how did it behave?',
  objects: 'What did you find or notice, and where?',
  body: 'What did you feel in your body, and when?',
  questions: 'What question is on your heart today?',
  synchronicities: 'What coincidence caught your attention?',
};

const SITUATIONS: Record<LifeSituationKey, string> = {
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

/** Each life situation borrows the tint/accent of a category so the list feels alive but stays on palette. */
const SITUATION_PALETTE: Record<LifeSituationKey, CategoryKey> = {
  love: 'numbers',
  breakups: 'objects',
  family: 'people',
  friendships: 'animals',
  career: 'places',
  money: 'questions',
  home: 'life',
  travel: 'signs',
  endings: 'body',
  decisions: 'dreams',
  encounters: 'synchronicities',
  growth: 'people',
  loss: 'words',
  repeated: 'signs',
  unexplained: 'dreams',
};

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function categoryLabel(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.label`, { defaultValue: LABELS[key] });
}

/** Three short hints for the composer; [] when the copy is missing. */
export function categoryBullets(t: TFunction, key: CategoryKey): string[] {
  return toStringList(t(`categories.${key}.bullets`, { returnObjects: true, defaultValue: [] }));
}

export function categoryPlaceholder(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.placeholder`, { defaultValue: PLACEHOLDERS[key] });
}

export function lifeTitle(t: TFunction): string {
  return t('categories.life.title', { defaultValue: LABELS.life });
}

export function lifeIntro(t: TFunction): string {
  return t('categories.life.intro', {
    defaultValue: 'Choose the part of life that feels most present right now.',
  });
}

export function situationLabel(t: TFunction, key: LifeSituationKey): string {
  return t(`categories.situations.${key}.label`, { defaultValue: SITUATIONS[key] });
}

export function situationPlaceholder(t: TFunction, key: LifeSituationKey): string {
  return t(`categories.situations.${key}.placeholder`, {
    defaultValue: 'What is happening, and how does it feel?',
  });
}

/** Tint/accent pair for a life situation row or chip. */
export function situationColors(key: LifeSituationKey): Pick<CategoryDef, 'tint' | 'accent'> {
  const { tint, accent } = categoryByKey(SITUATION_PALETTE[key]);
  return { tint, accent };
}

/** Label for an entry's category, with the life situation appended when present. */
export function entryTopicLabel(t: TFunction, key: CategoryKey, sub?: LifeSituationKey): string {
  return key === 'life' && sub ? situationLabel(t, sub) : categoryLabel(t, key);
}


/** The most specific label for an entry: the life situation when there is one. */
export function entryCategoryLabel(
  t: TFunction,
  entry: Pick<JournalEntry, 'category' | 'subcategory'>,
): string {
  return entryTopicLabel(t, entry.category, entry.subcategory);
}
