/**
 * Mocked Premium insights. The Insights screen combines these with counts
 * computed from the journal so the numbers match the calendar.
 *
 * Every count below is taken from the six entries in brand/sample-entries.ts
 * (entries counted once each, in either language):
 *   Threshold symbols (doors or 11)  4  sea-door, eleven, feather, last-day
 *   Endings & transitions            4  eleven, feather, last-day, heron
 *   Stillness                        3  sea-door, heron, lighthouse
 *   Loved ones close by              3  sea-door, feather, lighthouse
 *   Letting go                       2  feather, last-day
 * Symbols: light 4, doors 3, water 3, the number 11 in 2 entries,
 * dawn 2, lighthouses 3 times in one entry.
 */
import type { Language } from '../src/state/types';

export interface InsightTheme {
  /** i18n-free label per language. */
  label: Record<Language, string>;
  /** How many times it appeared this month (mocked). */
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
    en: 'Threshold symbols like doors and the number 11 appeared in 4 entries this month, most often on days you wrote about endings.',
    es: 'Los símbolos de umbral, como las puertas y el número 11, aparecieron en 4 entradas este mes, la mayoría de las veces en días en que escribiste sobre algo que terminaba.',
  },
  themes: [
    { label: { en: 'Endings & transitions', es: 'Cierres y transiciones' }, count: 4 },
    { label: { en: 'Stillness', es: 'Quietud' }, count: 3 },
    { label: { en: 'Loved ones close by', es: 'Seres queridos cerca' }, count: 3 },
    { label: { en: 'Letting go', es: 'Soltar' }, count: 2 },
  ],
  symbols: {
    en: ['Light', 'Doors', 'Water', '11:11', 'Dawn', 'Lighthouses'],
    es: ['Luz', 'Puertas', 'Agua', '11:11', 'Amanecer', 'Faros'],
  },
  journey: {
    en: 'Your month began with a dream of a door you weren’t sure you were allowed to walk through, and it ends with three lighthouses in a single day. In between, you closed an eleven-year chapter and moved from asking permission to paying quiet attention: a feather on the doormat, a heron in the shallows, the sun coming up over the lake. Lately you write less about what is ending and more about what stays lit.',
    es: 'Tu mes empezó con el sueño de una puerta que no sabías si podías cruzar, y termina con tres faros en un solo día. En medio, cerraste un ciclo de once años y pasaste de pedir permiso a observar con calma: una pluma en el tapete de la entrada, una garza en la orilla, el sol saliendo sobre el lago. Últimamente escribes menos sobre lo que termina y más sobre la luz que sigue encendida.',
  },
};
