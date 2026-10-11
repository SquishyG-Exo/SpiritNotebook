/**
 * Entry categories, the Life Situations list and the Home grid.
 *
 * Labels, subtitles, descriptions, hints and placeholders live in
 * locales/<lang>/categories.json, keyed by these `key` values (feature tiles
 * under `features.<key>`). Icons are icon names resolved in src/ui/icons.tsx
 * (lucide names, plus the custom `Butterfly` and `Lotus`).
 *
 * This file must stay free of React Native imports: the serverless API
 * imports it too.
 */

/** What a reader can log. 'signs' is "Everyday Signs" (it replaced Body Signs). */
export type CategoryKey =
  | 'dreams'
  | 'numbers'
  | 'signs'
  | 'animals'
  | 'life'
  | 'words'
  | 'questions'
  | 'gratitude';

/** Home tiles that open a feature rather than the composer. */
export type FeatureKey = 'whispers' | 'calendar' | 'search' | 'saved';

export type LifeSituationKey =
  | 'love'
  | 'breakups'
  | 'family'
  | 'friendships'
  | 'career'
  | 'money'
  | 'home'
  | 'travel'
  | 'endings'
  | 'decisions'
  | 'encounters'
  | 'growth'
  | 'loss'
  | 'repeated'
  | 'unexplained';

export interface CategoryDef {
  key: CategoryKey;
  /** Icon name, see src/ui/icons.tsx */
  icon: string;
  /** Soft tile background (chips, rows). */
  tint: string;
  /** Icon / accent color on the tint. */
  accent: string;
  /** True when tapping the tile opens a sub-list instead of the composer. */
  hasSubcategories?: boolean;
}

export interface LifeSituationDef {
  key: LifeSituationKey;
  icon: string;
}

export interface FeatureDef {
  key: FeatureKey;
  icon: string;
  /** Expo Router path the tile opens. */
  href: '/whispers' | '/calendar' | '/search' | '/favorites';
}

export type HomeTileDef =
  | { kind: 'category'; key: CategoryKey }
  | { kind: 'feature'; key: FeatureKey };

export const categories: readonly CategoryDef[] = [
  { key: 'dreams', icon: 'Moon', tint: '#EDE6FB', accent: '#6D5BBE' },
  { key: 'numbers', icon: 'Hash', tint: '#E1EFF4', accent: '#3E7F95' },
  { key: 'signs', icon: 'Butterfly', tint: '#FBE3EA', accent: '#B5577A' },
  { key: 'animals', icon: 'PawPrint', tint: '#E3F1EA', accent: '#4E8C6E' },
  { key: 'life', icon: 'Sunrise', tint: '#FCE9DC', accent: '#B8703E', hasSubcategories: true },
  { key: 'words', icon: 'MessageCircle', tint: '#F8E3E6', accent: '#B4566A' },
  { key: 'questions', icon: 'Lotus', tint: '#EBE3FA', accent: '#7A52B8' },
  { key: 'gratitude', icon: 'Heart', tint: '#FBE5E3', accent: '#C04F4F' },
];

export const features: readonly FeatureDef[] = [
  { key: 'whispers', icon: 'Sun', href: '/whispers' },
  { key: 'calendar', icon: 'CalendarDays', href: '/calendar' },
  { key: 'search', icon: 'Search', href: '/search' },
  { key: 'saved', icon: 'Bookmark', href: '/favorites' },
];

/** The Home grid, in the client's order (3 columns, 4 rows). */
export const homeTiles: readonly HomeTileDef[] = [
  { kind: 'category', key: 'dreams' },
  { kind: 'category', key: 'numbers' },
  { kind: 'category', key: 'signs' },
  { kind: 'category', key: 'animals' },
  { kind: 'category', key: 'life' },
  { kind: 'category', key: 'words' },
  { kind: 'category', key: 'questions' },
  { kind: 'category', key: 'gratitude' },
  { kind: 'feature', key: 'whispers' },
  { kind: 'feature', key: 'calendar' },
  { kind: 'feature', key: 'search' },
  { kind: 'feature', key: 'saved' },
];

export const lifeSituations: readonly LifeSituationDef[] = [
  { key: 'love', icon: 'Heart' },
  { key: 'breakups', icon: 'HeartCrack' },
  { key: 'family', icon: 'Users' },
  { key: 'friendships', icon: 'Handshake' },
  { key: 'career', icon: 'Briefcase' },
  { key: 'money', icon: 'Coins' },
  { key: 'home', icon: 'House' },
  { key: 'travel', icon: 'Plane' },
  { key: 'endings', icon: 'Leaf' },
  { key: 'decisions', icon: 'Scale' },
  { key: 'encounters', icon: 'Sparkle' },
  { key: 'growth', icon: 'Sprout' },
  { key: 'loss', icon: 'Feather' },
  { key: 'repeated', icon: 'Repeat' },
  { key: 'unexplained', icon: 'CircleHelp' },
];

export const categoryByKey = (key: CategoryKey): CategoryDef =>
  categories.find((c) => c.key === key) ?? categories[0];

export const featureByKey = (key: FeatureKey): FeatureDef =>
  features.find((f) => f.key === key) ?? features[0];

export const isCategoryKey = (value: unknown): value is CategoryKey =>
  typeof value === 'string' && categories.some((c) => c.key === value);

export const isLifeSituationKey = (value: unknown): value is LifeSituationKey =>
  typeof value === 'string' && lifeSituations.some((s) => s.key === value);
