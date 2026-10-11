/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { whisperOfTheDay, whispers } from '../../../brand/whispers';
import { buildSampleEntries, lastOccurrence } from '../seed';

const dayOf = (iso: string) => iso.slice(0, 10);
const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('lastOccurrence', () => {
  it('picks this year when the day has come, else last year', () => {
    expect(localDay(lastOccurrence('05-17', new Date(2026, 4, 17, 9)))).toBe('2026-05-17');
    expect(localDay(lastOccurrence('05-18', new Date(2026, 4, 17, 9)))).toBe('2025-05-18');
  });

  it('waits minDaysAgo days before moving to this year', () => {
    expect(localDay(lastOccurrence('05-17', new Date(2027, 5, 10), 60))).toBe('2026-05-17');
    expect(localDay(lastOccurrence('05-17', new Date(2027, 6, 20), 60))).toBe('2027-05-17');
  });
});

describe('sample journal', () => {
  it('keeps the blue boat dream before the harbor sighting in any year', () => {
    for (const today of [new Date(2026, 9, 11), new Date(2027, 4, 17), new Date(2027, 5, 10), new Date(2027, 6, 20)]) {
      const byId = Object.fromEntries(buildSampleEntries(today).map((e) => [e.id, e]));
      const dream = byId['sample-blue-boat'];
      const sighting = byId['sample-saw-blue-boat'];
      expect(dream && sighting).toBeTruthy();
      expect(dream!.createdAt < sighting!.createdAt).toBe(true);
      expect(dayOf(dream!.createdAt).slice(5)).toBe('05-17');
    }
  });

  it("holds the client's search example in both languages", () => {
    const entries = buildSampleEntries(new Date(2026, 9, 11));
    const titled = (title: RegExp) => entries.filter((e) => Object.values(e.localized ?? {}).some((c) => title.test(c?.title ?? '')));
    expect(titled(/blue boat/i).map((e) => e.id).sort()).toEqual(['sample-blue-boat', 'sample-saw-blue-boat']);
    expect(titled(/barca azul/i).map((e) => e.id).sort()).toEqual(['sample-blue-boat', 'sample-saw-blue-boat']);
  });

  it('stores date-only samples at local noon and hides their time', () => {
    for (const entry of buildSampleEntries(new Date(2026, 9, 11))) {
      if (!entry.hasTime) expect(new Date(entry.createdAt).getHours()).toBe(12);
    }
    expect(buildSampleEntries().find((e) => e.id === 'sample-saw-blue-boat')?.hasTime).toBe(false);
  });

  it('never uses a removed category', () => {
    const removed = ['body', 'people', 'places', 'objects', 'synchronicities'];
    for (const entry of buildSampleEntries()) expect(removed).not.toContain(entry.category);
  });
});

describe('whispers', () => {
  it('have unique ids and text in both languages', () => {
    expect(new Set(whispers.map((w) => w.id)).size).toBe(whispers.length);
    for (const w of whispers) {
      expect(w.text.en.trim()).not.toBe('');
      expect(w.text.es.trim()).not.toBe('');
    }
  });

  it('only credit teachers from the reading list in brand/voice.md', () => {
    const voice = readFileSync('brand/voice.md', 'utf8');
    for (const w of whispers) {
      if (!w.inspiredBy) continue;
      expect(voice).toContain(w.inspiredBy.author);
      if (w.inspiredBy.work) expect(voice.replace(/’/g, "'")).toContain(w.inspiredBy.work.replace(/’/g, "'"));
    }
  });

  it('show the same whisper all day and a different one the next day', () => {
    const morning = whisperOfTheDay(new Date(2026, 2, 8, 0, 30));
    expect(whisperOfTheDay(new Date(2026, 2, 8, 23, 30)).id).toBe(morning.id);
    expect(whisperOfTheDay(new Date(2026, 2, 9, 0, 30)).id).not.toBe(morning.id);
  });
});
