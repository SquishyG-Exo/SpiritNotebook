/**
 * Journal search: finds saved entries by the words or phrases a reader
 * remembers ("blue boat", "11:11", "corazón"). Pure functions, no React.
 *
 * Matching
 *   - Case- and accent-insensitive: text is folded (NFD, diacritics stripped,
 *     lower case), so "corazon" finds "corazón", "cafe" finds "café", and the
 *     other way round.
 *   - A term matches at the start of a word: "boat" finds "boat" and "boats",
 *     not "sailboat"; "art" never matches inside "heart". Plural terms are
 *     lightly stemmed ("boats" finds "boat", "flores" finds "flor").
 *   - Every term must appear somewhere in the entry (AND), in any field.
 *     Small words ("a", "the", "de", "la") are ignored when the query has
 *     other words; inside a phrase they still count ("door to the sea").
 *   - Only saved entries are searched, in the reader's current language.
 *
 * Ranking: score, then newest first.
 *   Each matched term adds the weight of every field it appears in
 *   (FIELD_WEIGHTS: the reader's own title, the reading title, the category /
 *   life-situation label, the entry text and personal note, the
 *   interpretation). The exact phrase adds twice that field's weight again,
 *   and a title equal to the whole query a large bonus.
 *
 * Excerpt: about EXCERPT_LENGTH characters around the first match (the exact
 * phrase when present) in the most relevant body field (text, note,
 * interpretation), cut at word boundaries or at a sentence end, with "…"
 * where it was cut, plus highlight ranges [start, end) inside it. Matched
 * words are highlighted whole ("boat" lights up "boats").
 *
 * For a screen that searches as the reader types, build the index once
 * (createSearchIndex, memoized on the entries and language) and run
 * searchIndex per query. searchEntries does both in one call.
 */
import type { CategoryKey } from '../../brand/categories';
import { resolveContent, type JournalEntry, type Language } from '../state/types';

export type SearchField = 'title' | 'readingTitle' | 'label' | 'text' | 'note' | 'interpretation';

/** "All", one category, or entries that carry a personal note. */
export type SearchFilter = 'all' | 'notes' | CategoryKey;

/** Character offsets [start, end) into a string. */
export type HighlightRange = [start: number, end: number];

export interface SearchResult {
  entry: JournalEntry;
  score: number;
  /** The field that contributed most to the score. */
  matchedField: SearchField;
  /** A short passage of the most relevant body field, with "…" where it was cut. */
  excerpt: string;
  /** Matched words inside `excerpt`, sorted and non-overlapping. */
  highlights: HighlightRange[];
}

export interface SearchIndexOptions {
  language: Language;
  /**
   * The entry's category / life-situation label(s) in `language`, e.g.
   * "Dreams" or ["Life Situations", "Endings & Transitions"], so typing a
   * category name finds its entries in either language.
   */
  labelFor?: (entry: JournalEntry) => string | readonly string[];
}

export interface SearchQueryOptions {
  filter?: SearchFilter;
  /** Maximum number of results (default: all). */
  limit?: number;
  /** Target excerpt length in characters (default EXCERPT_LENGTH). */
  excerptLength?: number;
}

export type SearchOptions = SearchIndexOptions & SearchQueryOptions;

export const FIELD_WEIGHTS: Readonly<Record<SearchField, number>> = {
  title: 10,
  readingTitle: 6,
  label: 4,
  text: 3,
  note: 3,
  interpretation: 1,
};

/** Target excerpt length: five or six lines beside the painting on a phone-width card. */
export const EXCERPT_LENGTH = 120;

/** Fields in index (and tie-break) order. */
const FIELD_ORDER: readonly SearchField[] = ['title', 'readingTitle', 'label', 'text', 'note', 'interpretation'];
/** Where excerpts come from, most relevant first. */
const BODY_FIELDS: readonly SearchField[] = ['text', 'note', 'interpretation'];
/** A term that only starts a longer word ("boat" in "boating") scores a little less. */
const PREFIX_FACTOR = 0.8;
/** Each repeat of a term in the same field adds a little, up to MAX_REPEATS. */
const REPEAT_BONUS = 0.1;
const MAX_REPEATS = 3;
/** The exact phrase in a field adds this multiple of the field's weight. */
const PHRASE_FACTOR = 2;
/** A title that equals the whole query. */
const EXACT_TITLE_BONUS: Partial<Record<SearchField, number>> = { title: 20, readingTitle: 10 };
/** Share of the excerpt shown before the first match. */
const LEAD_SHARE = 0.3;
/** Start at the very beginning rather than cut fewer than this share of the excerpt. */
const MIN_CUT_SHARE = 0.15;
/** End on a full stop when one closes after this share of the excerpt (and after the match). */
const SENTENCE_SHARE = 0.6;
const ELLIPSIS = '…';

/** Ignored when the query has other words (folded forms, English and Spanish). */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'at', 'by', 'for', 'from', 'i', 'in', 'into', 'is', 'it', 'my', 'of', 'on', 'or', 'the', 'to', 'with',
  'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'mi', 'mis', 'o', 'para', 'por', 'que', 'un', 'una',
  'unas', 'unos', 'y',
]);

/** Punctuation trimmed from both ends of a query word ("boat," → "boat"); inner punctuation stays ("11:11"). */
const EDGE_PUNCTUATION = /^[.,;:!?¡¿…"'()[\]{}«»*_~\-–—]+|[.,;:!?¡¿…"'()[\]{}«»*_~\-–—]+$/g;
const COMBINING_MARKS = /[̀-ͯ]/g;
/** Typographic quotes fold to their ASCII forms so "heron’s" and "heron's" match. */
const QUOTE_FOLDS: Record<string, string> = {
  '‘': "'",
  '’': "'",
  'ʼ': "'",
  '“': '"',
  '”': '"',
};

// ---------------------------------------------------------------------------
// Text folding

/** A string ready for matching, plus the way back to the original characters. */
interface PreparedText {
  /** The original text with whitespace collapsed: what excerpts are cut from. */
  display: string;
  /** Lower case, no diacritics: what terms are matched against. */
  folded: string;
  /** For each UTF-16 unit of `folded`, where its source character starts in `display`… */
  starts: number[];
  /** …and where it ends. */
  ends: number[];
}

function foldChar(char: string): string {
  if (char.length === 1 && char.charCodeAt(0) < 128) return char.toLowerCase();
  return QUOTE_FOLDS[char] ?? char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

function prepare(raw: string): PreparedText {
  const display = raw.replace(/\s+/g, ' ').trim();
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const char of display) {
    const out = foldChar(char);
    const end = offset + char.length;
    if (out.length === 0) {
      // A combining mark in already-decomposed text belongs to the letter before it.
      if (ends.length > 0) ends[ends.length - 1] = end;
    } else {
      for (let i = 0; i < out.length; i += 1) {
        starts.push(offset);
        ends.push(end);
      }
      folded += out;
    }
    offset = end;
  }
  return { display, folded, starts, ends };
}

/** Lower case, accent-free, single-spaced form of `text`: "Corazón  Azul" → "corazon azul". */
export function foldText(text: string): string {
  return prepare(text).folded;
}

function isWordChar(char: string | undefined): boolean {
  if (!char) return false;
  if (char >= '0' && char <= '9') return true;
  return char.toLowerCase() !== char.toUpperCase();
}

/** Light plural folding for English and Spanish; prefix matching covers the rest. */
export function stemTerm(term: string): string {
  if (term.length >= 6 && term.endsWith('es')) return term.slice(0, -2);
  if (term.length >= 5 && term.endsWith('s') && !term.endsWith('ss')) return term.slice(0, -1);
  return term;
}

function words(folded: string): string[] {
  return folded
    .split(' ')
    .map((word) => word.replace(EDGE_PUNCTUATION, ''))
    .filter(Boolean);
}

/** Drops small words from both ends ("a blue boat" → "blue boat"), keeping inner ones ("door to the sea"). */
function trimStopWords(list: string[]): string[] {
  let start = 0;
  let end = list.length;
  while (start < end && STOP_WORDS.has(list[start])) start += 1;
  while (end > start && STOP_WORDS.has(list[end - 1])) end -= 1;
  return start < end ? list.slice(start, end) : list;
}

/** Comparable form of a whole title or query: folded, punctuation-trimmed, stemmed words. */
function titleKey(folded: string): string {
  return trimStopWords(words(folded)).map(stemTerm).join(' ');
}

// ---------------------------------------------------------------------------
// Queries

export interface ParsedQuery {
  /** Folded, stemmed, de-duplicated terms; every one must match. Empty for a blank query. */
  terms: string[];
  /**
   * The folded words as typed, without small words at either end and with the
   * last word stemmed ("a blue boats" → "blue boat"); only for 2+ words.
   */
  phrase?: string;
  /** The whole query in titleKey form, for exact-title matches. */
  key: string;
}

export function parseQuery(query: string): ParsedQuery {
  const typed = words(prepare(query).folded);
  const meaningful = typed.filter((word) => !STOP_WORDS.has(word));
  const chosen = meaningful.length > 0 ? meaningful : typed;
  const terms = [...new Set(chosen.map(stemTerm))];
  const core = trimStopWords(typed);
  const phrase = core.length > 1 ? [...core.slice(0, -1), stemTerm(core[core.length - 1])].join(' ') : undefined;
  return { terms, phrase, key: core.map(stemTerm).join(' ') };
}

/** Positions where `needle` starts a word in `haystack` (anywhere, if the needle starts with a symbol). */
function findWordStarts(haystack: string, needle: string): number[] {
  const positions: number[] = [];
  if (!needle) return positions;
  const anywhere = !isWordChar(needle[0]);
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    if (anywhere || index === 0 || !isWordChar(haystack[index - 1])) positions.push(index);
    index = haystack.indexOf(needle, index + 1);
  }
  return positions;
}

/** End of a match, extended to the end of the word it starts ("boat" in "boats" → "boats"). */
function matchEnd(haystack: string, start: number, needle: string): number {
  let end = start + needle.length;
  if (!isWordChar(needle[needle.length - 1])) return end;
  while (end < haystack.length && isWordChar(haystack[end])) end += 1;
  return end;
}

// ---------------------------------------------------------------------------
// Index

interface IndexedField {
  field: SearchField;
  text: PreparedText;
  /** titleKey of the field, for title fields only. */
  key?: string;
}

interface SearchDocument {
  entry: JournalEntry;
  time: number;
  hasNote: boolean;
  fields: IndexedField[];
}

export interface SearchIndex {
  readonly language: Language;
  readonly documents: readonly SearchDocument[];
}

function asList(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return [];
  return typeof value === 'string' ? [value] : value;
}

/** Folds every saved entry once, so each keystroke only has to match. */
export function createSearchIndex(entries: readonly JournalEntry[], options: SearchIndexOptions): SearchIndex {
  const documents = entries
    .filter((entry) => entry.status === 'saved')
    .map((entry): SearchDocument => {
      const content = resolveContent(entry, options.language);
      const label = asList(options.labelFor?.(entry))
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' · ');
      const raw: Record<SearchField, string | undefined> = {
        title: content.title,
        readingTitle: content.reading?.title,
        label,
        text: content.text,
        note: content.note,
        interpretation: content.reading?.interpretation,
      };
      const fields = FIELD_ORDER.flatMap((field): IndexedField[] => {
        const text = prepare(raw[field] ?? '');
        if (!text.folded) return [];
        const isTitle = field === 'title' || field === 'readingTitle';
        return [{ field, text, key: isTitle ? titleKey(text.folded) : undefined }];
      });
      return {
        entry,
        time: Date.parse(entry.createdAt) || 0,
        hasNote: Boolean(content.note?.trim()),
        fields,
      };
    });
  return { language: options.language, documents };
}

// ---------------------------------------------------------------------------
// Filters

function passesFilter(entry: JournalEntry, hasNote: boolean, filter: SearchFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'notes') return hasNote;
  return entry.category === filter;
}

/** Whether an entry belongs under a filter chip (shared by Search and the Notebook). */
export function matchesFilter(entry: JournalEntry, filter: SearchFilter, language: Language): boolean {
  return passesFilter(entry, Boolean(resolveContent(entry, language).note?.trim()), filter);
}

export function filterEntries(
  entries: readonly JournalEntry[],
  filter: SearchFilter,
  language: Language,
): JournalEntry[] {
  return entries.filter((entry) => matchesFilter(entry, filter, language));
}

// ---------------------------------------------------------------------------
// Scoring

interface FieldHits {
  field: IndexedField;
  /** term → folded positions */
  terms: Map<string, number[]>;
  phrase: number[];
}

interface Scored {
  score: number;
  matchedField: SearchField;
  hits: FieldHits[];
}

function scoreDocument(doc: SearchDocument, query: ParsedQuery): Scored | null {
  const found = new Set<string>();
  const hits: FieldHits[] = [];
  let total = 0;
  let best: { field: SearchField; score: number } | undefined;

  for (const indexed of doc.fields) {
    const { folded } = indexed.text;
    const weight = FIELD_WEIGHTS[indexed.field];
    const terms = new Map<string, number[]>();
    let score = 0;

    for (const term of query.terms) {
      const positions = findWordStarts(folded, term);
      if (positions.length === 0) continue;
      terms.set(term, positions);
      found.add(term);
      const whole = positions.some((p) => matchEnd(folded, p, term) === p + term.length);
      score += weight * (whole ? 1 : PREFIX_FACTOR);
      score += weight * REPEAT_BONUS * Math.min(positions.length - 1, MAX_REPEATS);
    }

    const phrase = query.phrase ? findWordStarts(folded, query.phrase) : [];
    if (phrase.length > 0) score += weight * PHRASE_FACTOR;
    if (indexed.key !== undefined && indexed.key === query.key) score += EXACT_TITLE_BONUS[indexed.field] ?? 0;

    if (terms.size > 0 || phrase.length > 0) hits.push({ field: indexed, terms, phrase });
    if (score > 0 && (!best || score > best.score)) best = { field: indexed.field, score };
    total += score;
  }

  if (found.size < query.terms.length || !best) return null;
  return { score: Math.round(total * 100) / 100, matchedField: best.field, hits };
}

// ---------------------------------------------------------------------------
// Excerpts

/** The body field to quote: the exact phrase first, then the most terms, then text > note > interpretation. */
function pickBodyField(doc: SearchDocument, hits: readonly FieldHits[]): { text: PreparedText; hits?: FieldHits } {
  let chosen: FieldHits | undefined;
  let chosenRank = -Infinity;
  BODY_FIELDS.forEach((field, order) => {
    const candidate = hits.find((h) => h.field.field === field);
    if (!candidate || candidate.terms.size === 0) return;
    const rank = (candidate.phrase.length > 0 ? 1000 : 0) + candidate.terms.size * 10 - order;
    if (rank > chosenRank) {
      chosen = candidate;
      chosenRank = rank;
    }
  });
  if (chosen) return { text: chosen.field.text, hits: chosen };
  const text = doc.fields.find((f) => f.field === 'text')?.text ?? prepare('');
  return { text };
}

/** Folded ranges of every match in a field: the phrase and each term, extended to whole words. */
function foldedRanges(text: PreparedText, hits: FieldHits, query: ParsedQuery): HighlightRange[] {
  const ranges: HighlightRange[] = [];
  if (query.phrase) {
    for (const p of hits.phrase) ranges.push([p, matchEnd(text.folded, p, query.phrase)]);
  }
  for (const [term, positions] of hits.terms) {
    for (const p of positions) ranges.push([p, matchEnd(text.folded, p, term)]);
  }
  return ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
}

function toDisplay(text: PreparedText, [start, end]: HighlightRange): HighlightRange {
  return [text.starts[start], text.ends[end - 1]];
}

/** Whether display[i] closes a sentence: ".", "!", "?" or "…", maybe followed by a closing quote, then a space. */
function closesSentence(display: string, i: number): boolean {
  if (display[i + 1] !== ' ') return false;
  if (/[.!?…]/.test(display[i])) return true;
  return /["”’)]/.test(display[i]) && /[.!?…]/.test(display[i - 1] ?? '');
}

interface ExcerptWindow {
  start: number;
  end: number;
  /** The passage ends on a full sentence, so it needs no trailing ellipsis. */
  complete: boolean;
}

/** The passage to show around [anchorStart, anchorEnd), cut at spaces (or at a sentence end). */
function excerptWindow(display: string, anchorStart: number, anchorEnd: number, length: number): ExcerptWindow {
  if (display.length <= length) return { start: 0, end: display.length, complete: true };
  let start = Math.max(0, anchorStart - Math.round(length * LEAD_SHARE));
  // Near the end, slide back so the passage stays full length.
  start = Math.min(start, display.length - length);
  // "…dreamed I was" reads worse than "I dreamed I was": keep short openings whole.
  if (start <= Math.round(length * MIN_CUT_SHARE)) start = 0;
  if (start > 0 && display[start - 1] !== ' ') {
    // Mid-word: skip ahead to the next word, or back to the start of the word that holds the match.
    const next = display.indexOf(' ', start);
    start = next !== -1 && next < anchorStart ? next + 1 : display.lastIndexOf(' ', start) + 1;
  }
  let end = Math.min(display.length, start + length);
  if (end < display.length && display[end] !== ' ') {
    const space = display.lastIndexOf(' ', end);
    if (space > Math.max(start, anchorEnd - 1)) end = space;
    else {
      const next = display.indexOf(' ', Math.max(end, anchorEnd));
      end = next === -1 ? display.length : next;
    }
  }
  if (end >= display.length) return { start, end: display.length, complete: true };
  // "…pebbles on the bottom." reads better than "…on the bottom. There…".
  const floor = Math.max(anchorEnd, start + Math.round(length * SENTENCE_SHARE));
  for (let i = end - 1; i >= floor; i -= 1) {
    if (closesSentence(display, i)) return { start, end: i + 1, complete: true };
  }
  // No dangling commas or dashes before the ellipsis.
  while (end > Math.max(start, anchorEnd) && /[\s.,;:\-–—]/.test(display[end - 1])) end -= 1;
  return { start, end, complete: false };
}

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

function buildExcerpt(
  doc: SearchDocument,
  hits: readonly FieldHits[],
  query: ParsedQuery,
  length: number,
): Pick<SearchResult, 'excerpt' | 'highlights'> {
  const { text, hits: fieldHits } = pickBodyField(doc, hits);
  const display = text.display;
  if (!display) return { excerpt: '', highlights: [] };

  const ranges = fieldHits ? foldedRanges(text, fieldHits, query).map((r) => toDisplay(text, r)) : [];
  // Anchor on the exact phrase when the field has it, else on the earliest match.
  const phraseRange = fieldHits && query.phrase && fieldHits.phrase.length > 0
    ? toDisplay(text, [fieldHits.phrase[0], matchEnd(text.folded, fieldHits.phrase[0], query.phrase)])
    : undefined;
  const anchor = phraseRange ?? ranges[0] ?? [0, 0];

  const { start, end, complete } = excerptWindow(display, anchor[0], anchor[1], length);
  const prefix = start > 0 ? ELLIPSIS : '';
  const suffix = complete ? '' : ELLIPSIS;
  const shift = prefix.length - start;

  const highlights = mergeRanges(
    ranges
      .filter(([s, e]) => e > start && s < end)
      .map(([s, e]): HighlightRange => [Math.max(s, start) + shift, Math.min(e, end) + shift]),
  );
  return { excerpt: `${prefix}${display.slice(start, end)}${suffix}`, highlights };
}

// ---------------------------------------------------------------------------
// Search

function compareResults(a: { result: SearchResult; time: number }, b: { result: SearchResult; time: number }) {
  return b.result.score - a.result.score || b.time - a.time || a.result.entry.id.localeCompare(b.result.entry.id);
}

/** Runs a query against a prepared index. A blank query returns []. */
export function searchIndex(index: SearchIndex, query: string, options: SearchQueryOptions = {}): SearchResult[] {
  const parsed = parseQuery(query);
  if (parsed.terms.length === 0) return [];
  const filter = options.filter ?? 'all';
  const length = Math.max(40, options.excerptLength ?? EXCERPT_LENGTH);

  const found: { result: SearchResult; time: number }[] = [];
  for (const doc of index.documents) {
    if (!passesFilter(doc.entry, doc.hasNote, filter)) continue;
    const scored = scoreDocument(doc, parsed);
    if (!scored) continue;
    found.push({
      time: doc.time,
      result: {
        entry: doc.entry,
        score: scored.score,
        matchedField: scored.matchedField,
        ...buildExcerpt(doc, scored.hits, parsed, length),
      },
    });
  }

  found.sort(compareResults);
  const limited = options.limit !== undefined ? found.slice(0, Math.max(0, options.limit)) : found;
  return limited.map((item) => item.result);
}

/** One-shot search: builds the index for `entries` and runs `query`. */
export function searchEntries(entries: readonly JournalEntry[], query: string, options: SearchOptions): SearchResult[] {
  if (parseQuery(query).terms.length === 0) return [];
  return searchIndex(createSearchIndex(entries, options), query, options);
}

/** Whether `query` finds anything, without building excerpts. */
export function hasMatches(index: SearchIndex, query: string, filter: SearchFilter = 'all'): boolean {
  const parsed = parseQuery(query);
  if (parsed.terms.length === 0) return false;
  return index.documents.some((doc) => passesFilter(doc.entry, doc.hasNote, filter) && scoreDocument(doc, parsed));
}

/**
 * Example queries worth offering: the candidates (in order) that find at
 * least one entry, without duplicates, up to `max`.
 */
export function suggestQueries(index: SearchIndex, candidates: readonly string[], max = 4): string[] {
  const seen = new Set<string>();
  const picked: string[] = [];
  for (const candidate of candidates) {
    if (picked.length >= max) break;
    const label = candidate.replace(/\s+/g, ' ').trim();
    const key = foldText(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (hasMatches(index, label)) picked.push(label);
  }
  return picked;
}
