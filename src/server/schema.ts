import { z } from 'zod';

import {
  categories,
  lifeSituations,
  type CategoryKey,
  type LifeSituationKey,
} from '../../brand/categories';
import { brand, type BrandLanguage } from '../../brand/config';

const categoryKeys = categories.map((category) => category.key) as [CategoryKey, ...CategoryKey[]];
const lifeSituationKeys = lifeSituations.map((situation) => situation.key) as [
  LifeSituationKey,
  ...LifeSituationKey[],
];

/** Body of POST /api/interpret. Length limits apply to the trimmed text. */
export const InterpretRequestSchema = z.object(
  {
    text: z
      .string({ error: 'text must be a string' })
      .trim()
      .min(brand.ai.minInputChars, {
        error: `text must be at least ${brand.ai.minInputChars} characters`,
      })
      .max(brand.ai.maxInputChars, {
        error: `text must be at most ${brand.ai.maxInputChars} characters`,
      }),
    category: z.enum(categoryKeys, { error: 'category is not a known category' }),
    subcategory: z
      .enum(lifeSituationKeys, { error: 'subcategory is not a known life situation' })
      .nullish()
      .transform((value) => value ?? undefined),
    language: z.enum(brand.languages, {
      error: `language must be one of: ${brand.languages.join(', ')}`,
    }),
  },
  { error: 'Body must be a JSON object' },
);

/** A validated reading request. The parsed schema output is assignable to it. */
export interface InterpretInput {
  text: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  language: BrandLanguage;
}

export function describeIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request';
}

export const READING_KINDS = ['reading', 'care'] as const;

/**
 * The shape Claude is asked for, sent as the structured-output JSON schema.
 * Structured outputs cannot express length limits, so the descriptions carry
 * them and ReadingSchema enforces the hard bounds afterwards.
 */
export const ModelOutputSchema = z.object({
  kind: z
    .enum(READING_KINDS)
    .describe('"reading" for a normal reading; "care" only for the crisis path.'),
  title: z.string().describe('2 to 6 evocative words, no trailing period.'),
  interpretation: z
    .string()
    .describe(
      '120 to 180 words of plain text (never more than 200), one or two paragraphs separated by a blank line.',
    ),
  reflection_question: z
    .string()
    .describe('One open question the reader can journal about, ending with a question mark.'),
});

/** What the API accepts from the model before answering the client. */
export const ReadingSchema = z.object({
  kind: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
      z.enum(READING_KINDS),
    )
    .default('reading'),
  title: z.string().trim().min(1).max(80),
  interpretation: z.string().trim().min(40).max(2000),
  reflection_question: z.string().trim().min(5).max(300),
});

export type Reading = z.output<typeof ReadingSchema>;
