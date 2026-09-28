import { describe, expect, it } from 'vitest';

import { fallbacksFor, readConfig } from '../config';

describe('readConfig', () => {
  it('defaults to Sonnet 5 with the refusal fallback off', () => {
    const config = readConfig({});
    expect(config.model).toBe('claude-sonnet-5');
    expect(config.fallbacks).toBe('off');
    expect(config.effort).toBe('low');
  });

  it('turns the refusal fallback on for the Opus / Fable tier', () => {
    expect(readConfig({ ANTHROPIC_MODEL: 'claude-opus-5' }).fallbacks).toBe('default');
    expect(readConfig({ ANTHROPIC_MODEL: 'claude-fable-5-1' }).fallbacks).toBe('default');
    expect(readConfig({ ANTHROPIC_MODEL: 'claude-haiku-4-5' }).fallbacks).toBe('off');
  });

  it('lets ANTHROPIC_FALLBACKS override the model default', () => {
    expect(fallbacksFor('on', 'claude-sonnet-5')).toBe('default');
    expect(fallbacksFor('off', 'claude-opus-5')).toBe('off');
    expect(fallbacksFor(undefined, 'claude-opus-5')).toBe('default');
  });
});
