/**
 * Mocked Premium insights. The Insights screen combines these with counts
 * computed from the journal so the numbers match the calendar.
 *
 * PLACEHOLDER: the content pass fills this in.
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
    en: 'Transformation symbols appeared 4 times this month, often on days you wrote about endings.',
    es: 'Los símbolos de transformación aparecieron 4 veces este mes, a menudo en días en que escribiste sobre finales.',
  },
  themes: [
    { label: { en: 'Transformation', es: 'Transformación' }, count: 4 },
    { label: { en: 'Trust', es: 'Confianza' }, count: 3 },
    { label: { en: 'Letting go', es: 'Soltar' }, count: 2 },
  ],
  symbols: {
    en: ['Water', 'Light', 'Doors', '11:11'],
    es: ['Agua', 'Luz', 'Puertas', '11:11'],
  },
  journey: {
    en: 'Your entries this month move from noticing to trusting. Early in the month you recorded signs with curiosity; by the last week you were asking what they were asking of you.',
    es: 'Tus entradas de este mes van del observar al confiar. A principios de mes registrabas señales con curiosidad; en la última semana ya te preguntabas qué te estaban pidiendo.',
  },
};
