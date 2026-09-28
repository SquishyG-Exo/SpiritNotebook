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

export const READING_MODES = ['standard', 'advisor'] as const;
export type ReadingMode = (typeof READING_MODES)[number];

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
    /** 'advisor': the executor consults the advisor model before writing (lab setting). */
    mode: z
      .enum(READING_MODES, { error: 'mode must be standard or advisor' })
      .nullish()
      .transform((value) => value ?? 'standard'),
  },
  { error: 'Body must be a JSON object' },
);

/** A validated reading request. The parsed schema output is assignable to it. */
export interface InterpretInput {
  text: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  language: BrandLanguage;
  mode?: ReadingMode;
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
      '120 to 180 words of plain text (never more than 200): no HTML, no Markdown. One or two paragraphs separated by a single blank line. Do not end it with a question.',
    ),
  reflection_question: z
    .string()
    .describe('One open question the reader can journal about, ending with a question mark.'),
});

const BREAK_TAG = /\s*<\s*\/?\s*br\s*\/?\s*>\s*/gi;
const OTHER_TAG = /<\/?[a-z][^<>]*>/gi;
const MARKDOWN_EMPHASIS = /(\*\*|__|(?<!\w)[*_](?!\s))(.+?)\1/g;

/**
 * Models occasionally wrap paragraph breaks in HTML (`</br></br>`) or add
 * emphasis marks even when asked for plain text. The app renders plain text,
 * so markup is removed here and paragraph breaks are normalised to one blank
 * line.
 */
export function cleanParagraphs(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\r\n?/g, '\n')
    .replace(BREAK_TAG, '\n\n')
    .replace(/<\s*\/?\s*p\s*>/gi, '\n\n')
    .replace(OTHER_TAG, '')
    .replace(MARKDOWN_EMPHASIS, '$2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Single-line fields: markup removed, whitespace collapsed. */
export function cleanLine(value: unknown): unknown {
  const cleaned = cleanParagraphs(value);
  return typeof cleaned === 'string' ? cleaned.replace(/\s+/g, ' ').trim() : cleaned;
}

/** What the API accepts from the model before answering the client. */
export const ReadingSchema = z.object({
  kind: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
      z.enum(READING_KINDS),
    )
    .default('reading'),
  title: z.preprocess(cleanLine, z.string().min(1).max(80)),
  interpretation: z.preprocess(cleanParagraphs, z.string().min(40).max(2000)),
  reflection_question: z.preprocess(cleanLine, z.string().min(5).max(300)),
});

export type Reading = z.output<typeof ReadingSchema>;
