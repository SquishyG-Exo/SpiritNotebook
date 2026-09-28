import {
  isCategoryKey,
  isLifeSituationKey,
  type CategoryKey,
  type LifeSituationKey,
} from '../../../brand/categories';

/** Route params can arrive as string[]; take the first value. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export interface ComposerTopic {
  category: CategoryKey;
  subcategory?: LifeSituationKey;
}

/** Validates composer params: unknown categories fall back to Dreams; situations only apply to Life. */
export function parseComposerTopic(
  category: string | string[] | undefined,
  subcategory: string | string[] | undefined,
): ComposerTopic {
  const cat = firstParam(category);
  const sub = firstParam(subcategory);
  const resolved: CategoryKey = isCategoryKey(cat) ? cat : 'dreams';
  return {
    category: resolved,
    subcategory: resolved === 'life' && isLifeSituationKey(sub) ? sub : undefined,
  };
}
