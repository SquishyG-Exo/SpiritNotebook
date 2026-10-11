/**
 * Category and feature copy with safe fallbacks.
 *
 * Labels, subtitles, descriptions, hints and placeholders live in
 * brand/locales/<lang>/categories.json. Every lookup passes a defaultValue so
 * a screen never shows a raw key, even while that file is incomplete. The
 * fallbacks are English on purpose: they are a safety net, not a translation.
 *
 * Contract (categories.json):
 *   <category>.label | .subtitle | .description | .bullets[] | .placeholder | .titlePlaceholder
 *   life.title | life.intro
 *   situations.<situation>.label | .placeholder
 *   features.<feature>.label | .subtitle | .description
 */
import type { TFunction } from 'i18next';

import {
  categoryByKey,
  type CategoryDef,
  type CategoryKey,
  type FeatureKey,
  type HomeTileDef,
  type LifeSituationKey,
} from '../../brand/categories';
import type { JournalEntry } from '../state/types';

const LABELS: Record<CategoryKey, string> = {
  dreams: 'Dreams',
  numbers: 'Numbers',
  signs: 'Everyday Signs',
  animals: 'Animals',
  life: 'Life Situations',
  words: 'Repeated Words',
  questions: 'Spiritual Questions',
  gratitude: 'Daily Gratitude',
};

const SUBTITLES: Record<CategoryKey, string> = {
  dreams: 'Explore dream meanings',
  numbers: 'Angel numbers & sequences',
  signs: 'Coincidences & omens',
  animals: 'Messages they bring',
  life: 'Guidance for your journey',
  words: 'Words you keep hearing',
  questions: 'Ask & explore',
  gratitude: 'Notice life’s blessings',
};

const DESCRIPTIONS: Record<CategoryKey, string> = {
  dreams: 'Record and explore the spiritual meanings of your dreams.',
  numbers: 'Discover the messages behind repeating or meaningful numbers.',
  signs: 'Find meaning in everyday coincidences, objects, and signs around you.',
  animals: 'Explore the spiritual meaning of animals and the messages they bring.',
  life: 'Guidance and insights for real-life situations and challenges.',
  words: 'Discover the meaning behind words you keep hearing or seeing.',
  questions: 'Ask questions and receive spiritual insights and guidance.',
  gratitude: 'A space to write what you are grateful for and notice life’s blessings.',
};

const PLACEHOLDERS: Record<CategoryKey, string> = {
  dreams: 'Describe your dream: the places, people and feelings you remember…',
  numbers: 'Which numbers keep appearing, and where do you notice them?',
  signs: 'What did you notice? A coincidence, an object, a little omen…',
  animals: 'Which animal appeared, and how did it behave?',
  life: 'What is happening in your life right now?',
  words: 'Which words or phrases keep finding you?',
  questions: 'What question is on your heart today?',
  gratitude: 'What are you grateful for today?',
};

const FEATURE_LABELS: Record<FeatureKey, string> = {
  whispers: 'Whispers of Wisdom',
  calendar: 'Calendar',
  search: 'Search',
  saved: 'Saved',
};

const FEATURE_SUBTITLES: Record<FeatureKey, string> = {
  whispers: 'Uplifting messages',
  calendar: 'Relive your journey',
  search: 'Find past entries',
  saved: 'Your favorite insights',
};

const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  whispers: 'Receive a random uplifting message, quote, or guidance for your journey.',
  calendar: 'View and add all your entries by date. See what you recorded and relive your journey.',
  search: 'Find past entries, dreams, signs, numbers, words, and more.',
  saved: 'Keep your favorite entries, meanings, and insights in one place.',
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
  love: 'gratitude',
  breakups: 'signs',
  family: 'animals',
  friendships: 'life',
  career: 'numbers',
  money: 'life',
  home: 'animals',
  travel: 'numbers',
  endings: 'words',
  decisions: 'dreams',
  encounters: 'questions',
  growth: 'animals',
  loss: 'dreams',
  repeated: 'signs',
  unexplained: 'questions',
};

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function categoryLabel(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.label`, { defaultValue: LABELS[key] });
}

/** Short two-line subtitle under a Home tile. */
export function categorySubtitle(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.subtitle`, { defaultValue: SUBTITLES[key] });
}

/** One-sentence description (the client's "buttons and description" sheet). */
export function categoryDescription(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.description`, { defaultValue: DESCRIPTIONS[key] });
}

/** Three short hints for the composer; [] when the copy is missing. */
export function categoryBullets(t: TFunction, key: CategoryKey): string[] {
  return toStringList(t(`categories.${key}.bullets`, { returnObjects: true, defaultValue: [] }));
}

export function categoryPlaceholder(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.placeholder`, { defaultValue: PLACEHOLDERS[key] });
}

/** Placeholder for the optional title field, e.g. "Blue boat". */
export function categoryTitlePlaceholder(t: TFunction, key: CategoryKey): string {
  return t(`categories.${key}.titlePlaceholder`, { defaultValue: 'Give it a title (optional)' });
}

export function featureLabel(t: TFunction, key: FeatureKey): string {
  return t(`categories.features.${key}.label`, { defaultValue: FEATURE_LABELS[key] });
}

export function featureSubtitle(t: TFunction, key: FeatureKey): string {
  return t(`categories.features.${key}.subtitle`, { defaultValue: FEATURE_SUBTITLES[key] });
}

export function featureDescription(t: TFunction, key: FeatureKey): string {
  return t(`categories.features.${key}.description`, { defaultValue: FEATURE_DESCRIPTIONS[key] });
}

/** Label and subtitle for any Home tile. */
export function tileCopy(t: TFunction, tile: HomeTileDef): { label: string; subtitle: string } {
  return tile.kind === 'category'
    ? { label: categoryLabel(t, tile.key), subtitle: categorySubtitle(t, tile.key) }
    : { label: featureLabel(t, tile.key), subtitle: featureSubtitle(t, tile.key) };
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
