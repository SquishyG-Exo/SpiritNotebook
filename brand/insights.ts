/**
 * Mocked Premium insights. The Insights screen combines these with counts
 * computed from the journal so the numbers match the calendar.
 *
 * Every count below is taken from the nine entries in brand/sample-entries.ts,
 * in the reader's own words (title, text and note), each entry counted once;
 * EN and ES give the same tally:
 *   Endings & transitions   5  gratitude, heron, last-day, feather, eleven
 *   Loved ones close by     4  gratitude, lighthouse, sea-door, saw-blue-boat
 *   Stillness               3  heron, sea-door, saw-blue-boat
 *   Lightness & freedom     3  last-day, saw-blue-boat, blue-boat
 * Symbols:
 *   water        5  lighthouse, heron, sea-door, saw-blue-boat, blue-boat
 *   light        6  gratitude, lighthouse, heron, last-day, sea-door, blue-boat
 *                   (light, sun or a lighthouse)
 *   doors        3  last-day, feather, sea-door
 *   boats        2  saw-blue-boat, blue-boat (both blue)
 *   the number 11  2  eleven (three sightings), last-day (eleven years)
 *   lighthouses  2  lighthouse (three in one day), gratitude (the postcard)
 * Summary: water in 5 entries; threshold symbols (doors or 11) in 4
 * (sea-door, eleven, feather, last-day), 3 of them endings entries.
 * Time words stay true for relative dates: the blue-boat dream is always on
 * May 17, the harbor sighting about six weeks back, the lighthouses
 * yesterday and the gratitude entry this morning.
 */
import type { Language } from '../src/state/types';

export interface InsightTheme {
  /** i18n-free label per language. */
  label: Record<Language, string>;
  /** In how many entries it appears (mocked from the sample journal). */
  count: number;
}

export interface InsightsContent {
  summary: Record<Language, string>;
  themes: InsightTheme[];
  symbols: Record<Language, string[]>;
  journey: Record<Language, string>;
}

export const insights: InsightsContent = {
  summary: {
    en: 'Water ran through 5 of your entries, from the blue boat you dreamed of in May to yesterday’s lighthouses. Threshold symbols like doors and the number 11 appeared in 4, most often on days you wrote about endings.',
    es: 'El agua corrió por 5 de tus entradas, desde la barca azul que soñaste en mayo hasta los faros de ayer. Los símbolos de umbral, como las puertas y el número 11, aparecieron en 4, casi siempre en días en que escribiste sobre algo que terminaba.',
  },
  themes: [
    { label: { en: 'Endings & transitions', es: 'Cierres y transiciones' }, count: 5 },
    { label: { en: 'Loved ones close by', es: 'Seres queridos cerca' }, count: 4 },
    { label: { en: 'Stillness', es: 'Quietud' }, count: 3 },
    { label: { en: 'Lightness & freedom', es: 'Ligereza y libertad' }, count: 3 },
  ],
  symbols: {
    en: ['Water', 'Light', 'Doors', 'Boats', '11:11', 'Lighthouses'],
    es: ['Agua', 'Luz', 'Puertas', 'Barcas', '11:11', 'Faros'],
  },
  journey: {
    en: 'In May you dreamed of a small blue boat drifting on calm water, and some weeks ago you found that same blue tied up in a harbor. This past month began with a door to the sea you weren’t sure you could walk through. Since then you have closed an eleven-year chapter and moved from asking permission to paying quiet attention: a feather on the doormat, a heron in the shallows, three lighthouses in a single day. Lately you write less about what is ending and more about what stays lit: this morning it was sunflowers, a postcard, and a pink sky.',
    es: 'En mayo soñaste con una pequeña barca azul que flotaba sobre aguas tranquilas, y hace unas semanas encontraste ese mismo azul amarrado en un puerto. Este último mes empezó con una puerta al mar que no sabías si podías cruzar. Desde entonces cerraste un ciclo de once años y pasaste de pedir permiso a observar con calma: una pluma en el tapete de la entrada, una garza en la orilla, tres faros en un solo día. Últimamente escribes menos sobre lo que termina y más sobre la luz que sigue encendida: esta mañana fueron unos girasoles, una postal y un cielo rosa.',
  },
};
