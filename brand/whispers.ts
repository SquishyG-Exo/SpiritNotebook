/**
 * Whispers of Wisdom: short uplifting messages, shown one at a time.
 *
 * Every whisper is original writing. `inspiredBy` names the teacher or work
 * whose ideas it echoes (shown as "In the spirit of …"); it is never a quote.
 *
 * PLACEHOLDER: the content pass replaces the list (keep the exported shape).
 */
import type { Language } from '../src/state/types';

export interface Whisper {
  id: string;
  text: Record<Language, string>;
  inspiredBy?: { author: string; work?: string };
}

export const whispers: Whisper[] = [
  {
    id: 'w-presence',
    text: {
      en: 'This breath is the only place your life is happening. Rest here a moment.',
      es: 'Esta respiración es el único lugar donde tu vida está sucediendo. Descansa aquí un momento.',
    },
    inspiredBy: { author: 'Eckhart Tolle', work: 'The Power of Now' },
  },
  {
    id: 'w-start-where',
    text: {
      en: 'You do not need to be ready. Begin exactly where you are, with what you have.',
      es: 'No necesitas estar lista. Empieza justo donde estás, con lo que tienes.',
    },
    inspiredBy: { author: 'Pema Chödrön', work: 'The Wisdom of No Escape' },
  },
  {
    id: 'w-signs',
    text: {
      en: 'Coincidences are gentle knocks on the door. Open it with curiosity.',
      es: 'Las coincidencias son golpecitos suaves en la puerta. Ábrela con curiosidad.',
    },
    inspiredBy: { author: 'James Redfield', work: 'The Celestine Prophecy' },
  },
];

/** The same whisper all day, a new one tomorrow. */
export function whisperOfTheDay(date: Date = new Date()): Whisper {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return whispers[dayOfYear % whispers.length];
}

export const whisperById = (id: string): Whisper | undefined => whispers.find((w) => w.id === id);
