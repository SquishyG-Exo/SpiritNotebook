/**
 * Painterly artwork (generated for this preview, stored in assets/art).
 * One registry so every screen uses the same pictures.
 *
 *   art.skyHome   watercolor sunset sky over the sea, calm centre (Home)
 *   art.skyDusk   the same scene with more defined clouds (secondary screens)
 *   art.lotus     watercolor lotus with gold accents, transparent (logo)
 *   categoryThumbs[category]   square painting per entry category
 *   entryImage(entry)          the picture for an entry: its sample photo, else its category painting
 */
import type { ImageRequireSource } from 'react-native';

import type { CategoryKey } from '../../../brand/categories';
import type { JournalEntry } from '../../state/types';

export const art = {
  skyHome: require('../../../assets/art/sky-home.webp') as ImageRequireSource,
  skyDusk: require('../../../assets/art/sky-dusk.webp') as ImageRequireSource,
  lotus: require('../../../assets/art/lotus.webp') as ImageRequireSource,
  /** Intrinsic aspect ratio (width / height) of the lotus image. */
  lotusAspect: 600 / 707,
} as const;

export const categoryThumbs: Record<CategoryKey, ImageRequireSource> = {
  dreams: require('../../../assets/art/thumbs/dreams.webp'),
  numbers: require('../../../assets/art/thumbs/numbers.webp'),
  signs: require('../../../assets/art/thumbs/signs.webp'),
  animals: require('../../../assets/art/thumbs/animals.webp'),
  life: require('../../../assets/art/thumbs/life.webp'),
  words: require('../../../assets/art/thumbs/words.webp'),
  questions: require('../../../assets/art/thumbs/questions.webp'),
  gratitude: require('../../../assets/art/thumbs/gratitude.webp'),
  people: require('../../../assets/art/thumbs/people.webp'),
  places: require('../../../assets/art/thumbs/places.webp'),
  objects: require('../../../assets/art/thumbs/objects.webp'),
  synchronicities: require('../../../assets/art/thumbs/synchronicities.webp'),
};

/** Sample entries that carry their own "photo" (the demo's attached pictures). */
const SAMPLE_PHOTOS: Record<string, ImageRequireSource> = {
  'sample-blue-boat': require('../../../assets/art/photos/blue-boat.webp'),
  'sample-saw-blue-boat': require('../../../assets/art/photos/harbor-boat.webp'),
};

export function entryImage(entry: Pick<JournalEntry, 'id' | 'category'>): ImageRequireSource {
  return SAMPLE_PHOTOS[entry.id] ?? categoryThumbs[entry.category];
}
