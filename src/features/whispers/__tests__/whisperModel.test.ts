import { describe, expect, it } from 'vitest';

import { whispers, whisperOfTheDay, type Whisper } from '../../../../brand/whispers';
import { pickAnother, resolveWhisper } from '../whisperModel';

const list: Whisper[] = [
  { id: 'a', text: { en: 'A', es: 'A' } },
  { id: 'b', text: { en: 'B', es: 'B' } },
  { id: 'c', text: { en: 'C', es: 'C' } },
];

describe('pickAnother', () => {
  it('never returns the current whisper', () => {
    for (const r of [0, 0.34, 0.5, 0.99, 0.9999]) {
      expect(pickAnother('b', () => r, list).id).not.toBe('b');
    }
  });

  it('covers every other whisper', () => {
    const seen = new Set([0, 0.6].map((r) => pickAnother('a', () => r, list).id));
    expect(seen).toEqual(new Set(['b', 'c']));
  });

  it('falls back to the only whisper there is', () => {
    expect(pickAnother('a', () => 0.5, [list[0]]).id).toBe('a');
  });
});

describe('resolveWhisper', () => {
  const today = new Date(2026, 9, 11);

  it('opens the whisper named in the link', () => {
    const target = whispers[whispers.length - 1];
    expect(resolveWhisper(target.id, today).id).toBe(target.id);
  });

  it('falls back to the whisper of the day', () => {
    expect(resolveWhisper(undefined, today).id).toBe(whisperOfTheDay(today).id);
    expect(resolveWhisper('no-such-whisper', today).id).toBe(whisperOfTheDay(today).id);
  });
});
