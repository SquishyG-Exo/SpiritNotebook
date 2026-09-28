import { describe, expect, it } from 'vitest';

import { brand } from '../../../brand/config';
import { describeIssue, InterpretRequestSchema, ReadingSchema } from '../schema';
import { sampleReading, validBody } from './helpers';

function issueFor(body: unknown): string {
  const result = InterpretRequestSchema.safeParse(body);
  if (result.success) throw new Error('expected the body to be rejected');
  return describeIssue(result.error);
}

describe('InterpretRequestSchema', () => {
  it('accepts a valid body and trims the text', () => {
    const result = InterpretRequestSchema.parse(validBody);
    expect(result).toEqual({
      text: validBody.text.trim(),
      category: 'animals',
      language: 'en',
      subcategory: undefined,
    });
  });

  it('rejects text that is too short once trimmed', () => {
    const short = `   ${'a'.repeat(brand.ai.minInputChars - 1)}   `;
    expect(issueFor({ ...validBody, text: short })).toBe(
      `text must be at least ${brand.ai.minInputChars} characters`,
    );
  });

  it('accepts the maximum length and rejects one character more', () => {
    const max = 'a'.repeat(brand.ai.maxInputChars);
    expect(InterpretRequestSchema.safeParse({ ...validBody, text: max }).success).toBe(true);
    expect(issueFor({ ...validBody, text: `${max}a` })).toBe(
      `text must be at most ${brand.ai.maxInputChars} characters`,
    );
  });

  it('rejects a missing or non-string text', () => {
    expect(issueFor({ category: 'dreams', language: 'en' })).toBe('text must be a string');
    expect(issueFor({ ...validBody, text: 42 })).toBe('text must be a string');
  });

  it('rejects an unknown category', () => {
    expect(issueFor({ ...validBody, category: 'tarot' })).toBe('category is not a known category');
  });

  it('rejects an unsupported language', () => {
    expect(issueFor({ ...validBody, language: 'fr' })).toBe('language must be one of: en, es');
  });

  it('accepts any known life situation, whatever the category', () => {
    expect(InterpretRequestSchema.parse({ ...validBody, category: 'life', subcategory: 'career' }))
      .toMatchObject({ subcategory: 'career' });
    expect(InterpretRequestSchema.parse({ ...validBody, category: 'dreams', subcategory: 'loss' }))
      .toMatchObject({ subcategory: 'loss' });
  });

  it('rejects an unknown subcategory and treats null as absent', () => {
    expect(issueFor({ ...validBody, subcategory: 'lottery' })).toBe(
      'subcategory is not a known life situation',
    );
    expect(InterpretRequestSchema.parse({ ...validBody, subcategory: null }).subcategory).toBeUndefined();
  });

  it('rejects a body that is not an object', () => {
    expect(issueFor([])).toBe('Body must be a JSON object');
    expect(issueFor('a heron')).toBe('Body must be a JSON object');
  });
});

describe('ReadingSchema', () => {
  it('accepts a well-formed reading', () => {
    expect(ReadingSchema.parse(sampleReading)).toEqual(sampleReading);
  });

  it("defaults kind to 'reading' when absent and normalises its casing", () => {
    const { kind: _kind, ...withoutKind } = sampleReading;
    expect(ReadingSchema.parse(withoutKind).kind).toBe('reading');
    expect(ReadingSchema.parse({ ...sampleReading, kind: ' Care ' }).kind).toBe('care');
  });

  it('rejects unknown kinds', () => {
    expect(ReadingSchema.safeParse({ ...sampleReading, kind: 'crisis' }).success).toBe(false);
  });

  it('rejects empty and whitespace-only fields', () => {
    for (const field of ['title', 'interpretation', 'reflection_question'] as const) {
      expect(ReadingSchema.safeParse({ ...sampleReading, [field]: '' }).success).toBe(false);
      expect(ReadingSchema.safeParse({ ...sampleReading, [field]: '   ' }).success).toBe(false);
    }
  });

  it('enforces the length bounds', () => {
    const check = (patch: Partial<Record<keyof typeof sampleReading, string>>) =>
      ReadingSchema.safeParse({ ...sampleReading, ...patch }).success;
    expect(check({ title: 'a'.repeat(80) })).toBe(true);
    expect(check({ title: 'a'.repeat(81) })).toBe(false);
    expect(check({ interpretation: 'a'.repeat(39) })).toBe(false);
    expect(check({ interpretation: 'a'.repeat(2001) })).toBe(false);
    expect(check({ reflection_question: 'Why?' })).toBe(false);
    expect(check({ reflection_question: `${'a'.repeat(300)}?` })).toBe(false);
  });
});
