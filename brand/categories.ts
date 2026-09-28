/**
 * The Explore grid and the Life Situations list.
 * Labels, hints and placeholders live in locales/<lang>/categories.json,
 * keyed by these `key` values. Icons are lucide icon names resolved in
 * src/ui/icons.tsx.
 */
export type CategoryKey =
  | 'dreams'
  | 'numbers'
  | 'signs'
  | 'life'
  | 'people'
  | 'places'
  | 'words'
  | 'animals'
  | 'objects'
  | 'body'
  | 'questions'
  | 'synchronicities';

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
  /** lucide icon name, see src/ui/icons.tsx */
  icon: string;
  /** Soft tile background. */
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

export const categories: readonly CategoryDef[] = [
  { key: 'dreams', icon: 'Moon', tint: '#EDE6FB', accent: '#6D5BBE' },
  { key: 'numbers', icon: 'Hash', tint: '#FBE3EA', accent: '#C8698A' },
  { key: 'signs', icon: 'Sparkles', tint: '#E3EEF9', accent: '#5A8FC2' },
  { key: 'life', icon: 'Flower2', tint: '#FCE9DC', accent: '#D98A5A', hasSubcategories: true },
  { key: 'people', icon: 'Users', tint: '#E3F3EC', accent: '#4E9C7A' },
  { key: 'places', icon: 'Globe', tint: '#E6E9FA', accent: '#5F6BC0' },
  { key: 'words', icon: 'MessageCircle', tint: '#F4E4F3', accent: '#A85FA0' },
  { key: 'animals', icon: 'PawPrint', tint: '#F8EED9', accent: '#B98A3E' },
  { key: 'objects', icon: 'Gem', tint: '#FBE3EE', accent: '#C6608E' },
  { key: 'body', icon: 'PersonStanding', tint: '#E9F1E4', accent: '#6C9A5B' },
  { key: 'questions', icon: 'Sun', tint: '#FBEFD6', accent: '#D19A3A' },
  { key: 'synchronicities', icon: 'Infinity', tint: '#EBE3FA', accent: '#8153C9' },
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

export const isCategoryKey = (value: unknown): value is CategoryKey =>
  typeof value === 'string' && categories.some((c) => c.key === value);

export const isLifeSituationKey = (value: unknown): value is LifeSituationKey =>
  typeof value === 'string' && lifeSituations.some((s) => s.key === value);
