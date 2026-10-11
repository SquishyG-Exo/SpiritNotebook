import { describe, expect, it } from 'vitest';

import type { CategoryKey, LifeSituationKey } from '../../../brand/categories';
import type { EntryContent, JournalEntry, Language } from '../../state/types';
import {
  EXCERPT_LENGTH,
  createSearchIndex,
  filterEntries,
  foldText,
  hasMatches,
  matchesFilter,
  parseQuery,
  searchEntries,
  searchIndex,
  stemTerm,
  suggestQueries,
  type SearchOptions,
  type SearchResult,
} from '../search';

interface Fixture {
  id: string;
  date: string;
  category?: CategoryKey;
  subcategory?: LifeSituationKey;
  hasTime?: boolean;
  status?: JournalEntry['status'];
  title?: string;
  text: string;
  note?: string;
  readingTitle?: string;
  interpretation?: string;
  localized?: Partial<Record<Language, EntryContent>>;
}

function entry(f: Fixture): JournalEntry {
  const content: EntryContent = { text: f.text };
  if (f.title) content.title = f.title;
  if (f.note) content.note = f.note;
  if (f.readingTitle || f.interpretation) {
    content.reading = {
      kind: 'reading',
      language: 'en',
      title: f.readingTitle ?? '',
      interpretation: f.interpretation ?? '',
      reflectionQuestion: '',
    };
  }
  return {
    id: f.id,
    status: f.status ?? 'saved',
    createdAt: new Date(f.date).toISOString(),
    hasTime: f.hasTime ?? true,
    category: f.category ?? 'dreams',
    subcategory: f.subcategory,
    content,
    localized: f.localized,
  };
}

const blueBoat = entry({
  id: 'sample-blue-boat',
  category: 'dreams',
  date: '2026-05-17T07:10:00',
  title: 'Blue boat',
  text: 'I dreamed I was drifting in a small blue boat on clear, still water. The sky was turning pink and I wasn’t afraid at all.',
  readingTitle: 'Calm Water, Open Sky',
  interpretation: 'A small boat on calm water often speaks of a journey you are ready to make at your own pace.',
});

// Newer than the dream on purpose: the dream must still rank first.
const sawBlueBoat = entry({
  id: 'sample-saw-blue-boat',
  category: 'signs',
  date: '2026-07-03T12:00:00',
  hasTime: false,
  title: 'Saw a blue boat',
  text: 'Walking by the marina I saw a blue boat painted exactly like the one in my dream, tied up and gently rocking.',
  readingTitle: 'The Dream Comes Ashore',
  interpretation: 'When an image from a dream appears in waking life, it can feel like a quiet confirmation.',
});

const oceanBoat = entry({
  id: 'boat-ocean',
  category: 'dreams',
  date: '2025-03-02T06:30:00',
  title: 'Boat on the ocean',
  text: 'A wooden boat on open water, mountains behind it, and no one at the oars.',
  interpretation: 'Open water can represent transition\n\nand moving toward a new phase in life.',
});

const heron = entry({
  id: 'heron',
  category: 'animals',
  date: '2026-10-08T07:40:00',
  text: 'A great blue heron stood in the shallows at sunrise, so still I thought it was a branch.',
  note: 'Patience. I want to remember the heron’s stillness when I feel rushed at the cafe.',
  readingTitle: 'The Heron’s Patience',
  interpretation: 'The heron is a creature of the in-between, at home where the land meets the water.',
});

const cafe = entry({
  id: 'cafe',
  category: 'words',
  date: '2026-09-20T09:15:00',
  title: 'Café con leche',
  text: 'Three different people said “café con leche” to me today, out of nowhere.',
});

const corazon = entry({
  id: 'corazon',
  category: 'dreams',
  date: '2026-08-02T05:50:00',
  title: 'Barca y corazón',
  text: 'Soñé con una Barca pequeña en el lago y sentí el corazón tranquilo.',
});

const eleven = entry({
  id: 'eleven',
  category: 'numbers',
  date: '2026-09-26T13:05:00',
  text: '11:11 on the microwave, 11:11 on the dashboard, and lunch came to exactly $11.11.',
  readingTitle: 'Eleven at the Threshold',
});

const lastDay = entry({
  id: 'last-day',
  category: 'life',
  subcategory: 'endings',
  date: '2026-10-05T21:40:00',
  text: 'Last day at the flower shop. I turned the little sign on the door to CLOSED for the last time.',
  note: 'The side facing me says Open.',
});

const gratitude = entry({
  id: 'gratitude',
  category: 'gratitude',
  date: '2026-10-11T12:00:00',
  hasTime: false,
  text: 'Grateful for warm bread, my sister’s voice on the phone, and the first cold morning.',
});

const draft = entry({
  id: 'draft-blue-boat',
  status: 'draft',
  date: '2026-10-10T09:00:00',
  title: 'Blue boat again',
  text: 'Another blue boat, not saved yet.',
});

const journal = [blueBoat, sawBlueBoat, oceanBoat, heron, cafe, corazon, eleven, lastDay, gratitude, draft];

const LABELS: Record<Language, Record<CategoryKey, string>> = {
  en: {
    dreams: 'Dreams',
    numbers: 'Numbers',
    signs: 'Everyday Signs',
    animals: 'Animals',
    life: 'Life Situations',
    words: 'Repeated Words',
    questions: 'Spiritual Questions',
    gratitude: 'Daily Gratitude',
  },
  es: {
    dreams: 'Sueños',
    numbers: 'Números',
    signs: 'Señales cotidianas',
    animals: 'Animales',
    life: 'Situaciones de vida',
    words: 'Palabras repetidas',
    questions: 'Preguntas espirituales',
    gratitude: 'Gratitud diaria',
  },
};

const ENDINGS: Record<Language, string> = { en: 'Endings & Transitions', es: 'Cierres y transiciones' };

const labelsIn =
  (language: Language) =>
  (e: JournalEntry): string | string[] =>
    e.category === 'life' && e.subcategory === 'endings'
      ? [LABELS[language].life, ENDINGS[language]]
      : LABELS[language][e.category];

const EN: SearchOptions = { language: 'en', labelFor: labelsIn('en') };
const ES: SearchOptions = { language: 'es', labelFor: labelsIn('es') };

const ids = (results: SearchResult[]) => results.map((r) => r.entry.id);
const search = (query: string, options: Partial<SearchOptions> = {}, entries: JournalEntry[] = journal) =>
  searchEntries(entries, query, { ...EN, ...options });
const highlighted = (result: SearchResult) => result.highlights.map(([s, e]) => result.excerpt.slice(s, e));

describe('foldText', () => {
  it('folds case, accents and whitespace', () => {
    expect(foldText('  Corazón   AZUL ')).toBe('corazon azul');
    expect(foldText('Café')).toBe('cafe');
    expect(foldText('Soñé')).toBe('sone');
  });

  it('folds decomposed accents and typographic apostrophes', () => {
    expect(foldText('café')).toBe('cafe');
    expect(foldText('Heron’s')).toBe("heron's");
  });
});

describe('stemTerm', () => {
  it('folds common English and Spanish plurals', () => {
    expect(stemTerm('boats')).toBe('boat');
    expect(stemTerm('dreams')).toBe('dream');
    expect(stemTerm('glasses')).toBe('glass');
    expect(stemTerm('flores')).toBe('flor');
  });

  it('leaves short words and double s alone', () => {
    expect(stemTerm('glass')).toBe('glass');
    expect(stemTerm('this')).toBe('this');
    expect(stemTerm('boat')).toBe('boat');
  });
});

describe('parseQuery', () => {
  it('returns no terms for blank or punctuation-only queries', () => {
    for (const query of ['', '   ', '\n\t', '?!', '…', '“”']) {
      expect(parseQuery(query).terms).toEqual([]);
    }
  });

  it('trims punctuation around words but keeps it inside them', () => {
    expect(parseQuery('“Blue boat,”')).toMatchObject({ terms: ['blue', 'boat'], phrase: 'blue boat' });
    expect(parseQuery('11:11').terms).toEqual(['11:11']);
    expect(parseQuery('¿corazón?').terms).toEqual(['corazon']);
  });

  it('ignores small words when there are others, keeping inner ones in the phrase', () => {
    expect(parseQuery('a blue boat')).toMatchObject({ terms: ['blue', 'boat'], phrase: 'blue boat' });
    expect(parseQuery('the door to the sea')).toMatchObject({ terms: ['door', 'sea'], phrase: 'door to the sea' });
    expect(parseQuery('la barca')).toEqual({ terms: ['barca'], phrase: undefined, key: 'barca' });
    expect(parseQuery('the').terms).toEqual(['the']);
  });

  it('stems and de-duplicates terms', () => {
    expect(parseQuery('blue boats')).toMatchObject({ terms: ['blue', 'boat'], phrase: 'blue boat' });
    expect(parseQuery('boat Boat BOATS').terms).toEqual(['boat']);
  });
});

describe('searchEntries', () => {
  it('finds both blue boat entries, the dream titled "Blue boat" first', () => {
    const results = search('blue boat');
    expect(ids(results)).toEqual(['sample-blue-boat', 'sample-saw-blue-boat']);
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[0].matchedField).toBe('title');
  });

  it('is case-insensitive and tolerates punctuation and plurals', () => {
    const expected = ['sample-blue-boat', 'sample-saw-blue-boat'];
    expect(ids(search('BLUE Boat'))).toEqual(expected);
    expect(ids(search('“blue boat”?'))).toEqual(expected);
    expect(ids(search('blue boats'))).toEqual(expected);
  });

  it('returns nothing for an empty or whitespace query', () => {
    expect(search('')).toEqual([]);
    expect(search('   ')).toEqual([]);
    expect(search('\n\t ')).toEqual([]);
  });

  it('requires every term (AND), in any field', () => {
    expect(ids(search('boat ocean'))).toEqual(['boat-ocean']);
    expect(ids(search('blue heron'))).toEqual(['heron']);
    // "shallows" is in the text, "rushed" only in the personal note.
    expect(ids(search('shallows rushed'))).toEqual(['heron']);
    // Each word exists in the journal, never both in one entry.
    expect(search('blue oars')).toEqual([]);
  });

  it('searches only saved entries', () => {
    expect(search('again')).toEqual([]);
    expect(ids(search('blue boat'))).not.toContain('draft-blue-boat');
  });

  it('matches accents both ways', () => {
    expect(ids(search('corazon'))).toEqual(['corazon']);
    expect(ids(search('CORAZÓN'))).toEqual(['corazon']);
    expect(ids(search('sone'))).toEqual(['corazon']);
    expect(ids(search('barca'))).toEqual(['corazon']);
    // "Café" (title and text) and "cafe" (the heron note) find each other.
    expect(ids(search('cafe')).sort()).toEqual(['cafe', 'heron']);
    expect(ids(search('café')).sort()).toEqual(['cafe', 'heron']);
  });

  it('highlights the original accented word', () => {
    const [result] = search('corazon');
    expect(highlighted(result)).toEqual(['corazón']);
    expect(highlighted(search('sone con una barca')[0])).toEqual(['Soñé con una Barca']);
  });

  it('ranks the reader’s own title above mentions in the body', () => {
    const titled = entry({
      id: 'lighthouse-title',
      category: 'signs',
      date: '2026-01-05T10:00:00',
      title: 'Lighthouse',
      text: 'Three times today, in three different places.',
    });
    const mentioned = entry({
      id: 'lighthouse-body',
      category: 'signs',
      date: '2026-10-01T22:15:00',
      text: 'A lighthouse on a mug, a lighthouse in a library book and a postcard from my aunt.',
      interpretation: 'A lighthouse stands where the land ends.',
    });
    const results = search('lighthouse', {}, [mentioned, titled]);
    expect(ids(results)).toEqual(['lighthouse-title', 'lighthouse-body']);
    expect(results.map((r) => r.matchedField)).toEqual(['title', 'text']);
  });

  it('boosts the exact phrase over the same words apart', () => {
    const phrased = entry({ id: 'phrased', date: '2026-02-01T08:00:00', text: 'I saw a blue boat at the harbor.' });
    const scattered = entry({
      id: 'scattered',
      date: '2026-10-09T08:00:00',
      text: 'The boat was red and the whole sky above it was blue.',
    });
    expect(ids(search('blue boat', {}, [scattered, phrased]))).toEqual(['phrased', 'scattered']);
  });

  it('breaks score ties by newest first', () => {
    const older = entry({ id: 'older', date: '2026-03-01T08:00:00', text: 'A feather on the doormat.' });
    const newer = entry({ id: 'newer', date: '2026-04-01T08:00:00', text: 'A feather on the doormat.' });
    const results = search('feather', {}, [older, newer]);
    expect(ids(results)).toEqual(['newer', 'older']);
    expect(results[0].score).toBe(results[1].score);
  });

  it('matches at the start of words only', () => {
    const rowboat = entry({ id: 'rowboat', date: '2026-03-01T08:00:00', text: 'An old rowboat by the pier.' });
    const heart = entry({ id: 'heart', date: '2026-03-02T08:00:00', text: 'My heart felt light.' });
    expect(search('boat', {}, [rowboat])).toEqual([]);
    expect(search('art', {}, [heart])).toEqual([]);
    expect(ids(search('hea', {}, [heart]))).toEqual(['heart']);
  });

  it('ignores small words when the query has others', () => {
    expect(ids(search('a blue boat'))).toEqual(ids(search('blue boat')));
    for (const result of search('a blue boat')) {
      expect(highlighted(result).map(foldText)).not.toContain('a');
    }
  });

  it('finds numbers and times', () => {
    expect(ids(search('11:11'))).toEqual(['eleven']);
    expect(ids(search('11'))).toEqual(['eleven']);
    expect(ids(search('$11.11'))).toEqual(['eleven']);
  });

  it('searches category and life-situation labels in the reader’s language', () => {
    const dreams = ids(search('dreams'));
    expect(dreams).toEqual(expect.arrayContaining(['sample-blue-boat', 'boat-ocean', 'corazon']));
    expect(ids(search('everyday'))).toEqual(['sample-saw-blue-boat']);
    expect(ids(search('endings'))).toEqual(['last-day']);

    const sueños = ids(searchEntries(journal, 'sueños', ES)).sort();
    expect(sueños).toEqual(['boat-ocean', 'corazon', 'sample-blue-boat']);
    expect(ids(searchEntries(journal, 'cierres', ES))).toEqual(['last-day']);
    expect(searchEntries(journal, 'endings', ES)).toEqual([]);
  });

  it('works without labels', () => {
    expect(searchEntries(journal, 'everyday', { language: 'en' })).toEqual([]);
    expect(ids(searchEntries(journal, 'blue boat', { language: 'en' }))).toEqual([
      'sample-blue-boat',
      'sample-saw-blue-boat',
    ]);
  });

  it('searches the content in the reader’s language', () => {
    const bilingual = entry({
      id: 'heron-bilingual',
      category: 'animals',
      date: '2026-10-08T07:40:00',
      text: 'A great blue heron stood in the shallows.',
      localized: {
        en: { text: 'A great blue heron stood in the shallows.' },
        es: { text: 'Una garza grande, gris azulada, en la orilla del lago.' },
      },
    });
    expect(ids(searchEntries([bilingual], 'garza', ES))).toEqual(['heron-bilingual']);
    expect(searchEntries([bilingual], 'garza', EN)).toEqual([]);
    expect(searchEntries([bilingual], 'heron', ES)).toEqual([]);
  });

  it('reports the field that contributed most', () => {
    expect(search('patience')[0].matchedField).toBe('readingTitle');
    expect(search('open', {}, [lastDay])[0].matchedField).toBe('note');
    expect(search('transition', {}, [oceanBoat])[0].matchedField).toBe('interpretation');
    // The life-situation label "Endings & Transitions" outranks a mention in an interpretation.
    expect(search('transition').map((r) => [r.entry.id, r.matchedField])).toEqual([
      ['last-day', 'label'],
      ['boat-ocean', 'interpretation'],
    ]);
  });

  it('filters by category and by personal notes', () => {
    expect(ids(search('blue boat', { filter: 'dreams' }))).toEqual(['sample-blue-boat']);
    expect(ids(search('blue boat', { filter: 'signs' }))).toEqual(['sample-saw-blue-boat']);
    expect(ids(search('blue', { filter: 'notes' }))).toEqual(['heron']);
    expect(search('blue', { filter: 'gratitude' })).toEqual([]);
    expect(ids(search('blue', { filter: 'all' }))).toEqual(ids(search('blue')));
  });

  it('honours a result limit', () => {
    const all = search('blue');
    expect(all).toHaveLength(3);
    expect(search('blue', { limit: 1 })).toEqual(all.slice(0, 1));
    expect(search('blue', { limit: 0 })).toEqual([]);
  });

  it('ranks an exact title first, small words included', () => {
    // Every word counts: only the sign says "saw".
    expect(ids(search('saw a blue boat'))).toEqual(['sample-saw-blue-boat']);
    expect(ids(search('a blue boat'))).toEqual(['sample-blue-boat', 'sample-saw-blue-boat']);
  });

  it('gives the same results from a reusable index', () => {
    const index = createSearchIndex(journal, EN);
    for (const query of ['blue boat', 'cafe', 'dreams', '11:11']) {
      expect(searchIndex(index, query)).toEqual(search(query));
    }
  });
});

describe('excerpts and highlights', () => {
  const queries = ['blue boat', 'boats', 'heron', 'cafe', 'corazon', '11:11', 'water', 'her', 'dream'];

  it('keeps every highlight inside the excerpt, sorted and apart', () => {
    for (const query of queries) {
      for (const result of search(query)) {
        let previousEnd = 0;
        for (const [start, end] of result.highlights) {
          expect(start).toBeGreaterThanOrEqual(previousEnd);
          expect(end).toBeGreaterThan(start);
          expect(end).toBeLessThanOrEqual(result.excerpt.length);
          previousEnd = end;
        }
      }
    }
  });

  it('highlights only words the query matched', () => {
    for (const query of queries) {
      const { terms, phrase } = parseQuery(query);
      for (const result of search(query)) {
        for (const text of highlighted(result)) {
          const folded = foldText(text);
          const matched = terms.some((t) => folded.startsWith(t)) || (phrase ? folded.startsWith(phrase) : false);
          expect(matched, `"${text}" for "${query}"`).toBe(true);
        }
      }
    }
  });

  it('highlights the exact phrase as one range', () => {
    const [dream, sign] = search('blue boat');
    expect(highlighted(dream)).toEqual(['blue boat']);
    expect(highlighted(sign)).toEqual(['blue boat']);
  });

  it('extends prefix matches to the whole word', () => {
    expect(highlighted(search('her', {}, [heron])[0])).toEqual(['heron']);
    expect(highlighted(search('dream', {}, [blueBoat])[0])).toEqual(['dreamed']);
  });

  it('cuts long passages around the first match, at word boundaries, with ellipses', () => {
    const before =
      'It began as an ordinary walk along the river after work, with the light going gold over the bridge, the joggers passing, and the ducks arguing near the reeds while I tried not to think about anything at all. Then,';
    const after =
      'which nobody seemed to be steering, and it drifted under the bridge as if it knew exactly where it was going while the evening went on around it and the first lamps came on along the water.';
    const text = `${before} out of nowhere, a blue boat ${after}`;
    const long = entry({ id: 'long', date: '2026-06-01T19:00:00', text });
    const [result] = search('blue boat', {}, [long]);

    expect(result.excerpt.startsWith('…')).toBe(true);
    expect(result.excerpt.endsWith('…')).toBe(true);
    expect(result.excerpt.length).toBeLessThanOrEqual(EXCERPT_LENGTH + 2);
    expect(result.excerpt.length).toBeGreaterThan(90);
    expect(highlighted(result)).toEqual(['blue boat']);

    const inner = result.excerpt.slice(1, -1);
    const at = text.indexOf(inner);
    expect(at).toBeGreaterThan(0);
    expect(text[at - 1]).toBe(' ');
    expect(text[at + inner.length]).toMatch(/[\s,.]/);
    // The match sits in the first part of the passage, with context before it.
    const [start] = result.highlights[0];
    expect(start).toBeGreaterThan(10);
    expect(start).toBeLessThan(result.excerpt.length / 2);
  });

  it('keeps the opening whole rather than cutting only a word or two', () => {
    const text =
      'Last night I dreamed I was sitting quietly in a small blue boat on clear, calm water, so clear I could see pebbles on the bottom while the sky turned pink.';
    // Far enough in that the usual lead-in would cut the first words.
    expect(text.indexOf('blue boat')).toBeGreaterThan(Math.round(EXCERPT_LENGTH * 0.3));
    const [result] = search('blue boat', {}, [entry({ id: 'opening', date: '2026-06-04T08:00:00', text })]);
    expect(result.excerpt.startsWith('Last night I dreamed')).toBe(true);
    expect(result.excerpt.endsWith('…')).toBe(true);
    expect(highlighted(result)).toEqual(['blue boat']);
  });

  it('ends on a full sentence when one closes near the end of the passage', () => {
    const text =
      'I dreamed I was sitting in a small blue boat on clear, calm water, so clear I could see pebbles on the bottom. There was no wind at all, and the sky was turning pink.';
    const [result] = search('blue boat', {}, [entry({ id: 'sentence', date: '2026-06-05T08:00:00', text })]);
    expect(result.excerpt).toBe(
      'I dreamed I was sitting in a small blue boat on clear, calm water, so clear I could see pebbles on the bottom.',
    );
    expect(highlighted(result)).toEqual(['blue boat']);
  });

  it('slides the window back when the match is near the end', () => {
    const text =
      'All week the same image kept returning in small ways, on a mug, in a book, on the side of a delivery truck, and in the dream I had on Sunday night, until today when I finally saw a real heron.';
    const [result] = search('heron', {}, [entry({ id: 'end', date: '2026-06-02T08:00:00', text })]);
    expect(result.excerpt.startsWith('…')).toBe(true);
    expect(result.excerpt.endsWith('heron.')).toBe(true);
    expect(result.excerpt.length).toBeGreaterThan(90);
  });

  it('keeps short passages whole and collapses whitespace', () => {
    const [ocean] = search('transition', {}, [oceanBoat]);
    expect(ocean.excerpt).toBe('Open water can represent transition and moving toward a new phase in life.');
    expect(highlighted(ocean)).toEqual(['transition']);
  });

  it('quotes the body field that holds the phrase', () => {
    const noted = entry({
      id: 'noted',
      date: '2026-06-03T08:00:00',
      text: 'A boat again, the third this month.',
      note: 'It was a blue boat again, just like in May.',
    });
    const [result] = search('blue boat', {}, [noted]);
    expect(result.excerpt).toBe('It was a blue boat again, just like in May.');
    expect(highlighted(result)).toEqual(['blue boat']);
  });

  it('opens the entry text when only a title or label matched', () => {
    const titled = entry({
      id: 'titled',
      date: '2026-01-05T10:00:00',
      title: 'Lighthouse',
      text: 'Three times today, in three different places.',
    });
    const [result] = search('lighthouse', {}, [titled]);
    expect(result.excerpt).toBe('Three times today, in three different places.');
    expect(result.highlights).toEqual([]);

    const [label] = search('everyday');
    expect(label.excerpt.startsWith('Walking by the marina')).toBe(true);
    expect(label.highlights).toEqual([]);
  });

  it('respects a custom excerpt length', () => {
    const [result] = search('blue boat', { excerptLength: 60 });
    expect(result.excerpt.length).toBeLessThanOrEqual(62);
    expect(highlighted(result)).toEqual(['blue boat']);
  });
});

describe('filters', () => {
  const saved = journal.filter((e) => e.status === 'saved');

  it('matches categories, notes and all', () => {
    expect(matchesFilter(heron, 'notes', 'en')).toBe(true);
    expect(matchesFilter(blueBoat, 'notes', 'en')).toBe(false);
    expect(matchesFilter(blueBoat, 'dreams', 'en')).toBe(true);
    expect(matchesFilter(blueBoat, 'signs', 'en')).toBe(false);
    expect(matchesFilter(gratitude, 'all', 'en')).toBe(true);
  });

  it('filters lists in their original order', () => {
    expect(ids(filterEntries(saved, 'dreams', 'en').map((e) => ({ entry: e }) as SearchResult))).toEqual([
      'sample-blue-boat',
      'boat-ocean',
      'corazon',
    ]);
    expect(filterEntries(saved, 'notes', 'en').map((e) => e.id)).toEqual(['heron', 'last-day']);
    expect(filterEntries(saved, 'questions', 'en')).toEqual([]);
  });
});

describe('suggestions', () => {
  const index = createSearchIndex(journal, EN);

  it('keeps candidates that find something, in order, without duplicates', () => {
    const candidates = ['blue boat', 'unicorn', 'Blue  Boat', '11:11', 'heron', 'feather'];
    expect(suggestQueries(index, candidates, 3)).toEqual(['blue boat', '11:11', 'heron']);
    expect(suggestQueries(index, candidates)).toEqual(['blue boat', '11:11', 'heron']);
    expect(suggestQueries(index, ['', '  ', 'unicorn'])).toEqual([]);
  });

  it('knows whether a query finds anything', () => {
    expect(hasMatches(index, 'blue boat')).toBe(true);
    expect(hasMatches(index, 'blue boat', 'animals')).toBe(false);
    expect(hasMatches(index, 'unicorn')).toBe(false);
    expect(hasMatches(index, '   ')).toBe(false);
  });
});
