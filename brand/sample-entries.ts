/**
 * Preloaded demo journal. Dates are relative to "today" (daysAgo) so the
 * calendar always looks current. Each entry ships in every language.
 *
 * PLACEHOLDER: the content pass replaces this with six polished entries.
 */
import type { SampleEntry } from '../src/state/types';

export const sampleEntries: SampleEntry[] = [
  {
    id: 'sample-heron',
    daysAgo: 2,
    time: '07:40',
    category: 'animals',
    content: {
      en: {
        text: 'A grey heron landed on the fence outside my kitchen window and stood completely still, looking at me for a full minute before it flew off.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Heron’s Patience',
          interpretation:
            'The heron is a quiet teacher of stillness. It waits at the water’s edge, unbothered by the current, trusting that what it needs will come within reach. Meeting its gaze on an ordinary morning can feel like an invitation to slow down and stand in your own life with the same calm confidence. Perhaps something in you has been rushing toward an answer. The heron suggests the answer is already moving toward you, and your task is simply to remain present enough to notice it. There is dignity in waiting when the waiting is chosen. Let this visit remind you that patience is not passivity, and that watching with soft attention is its own kind of action.',
          reflectionQuestion: 'Where in your life might standing still be the bravest thing you can do right now?',
        },
      },
      es: {
        text: 'Una garza gris se posó en la valla frente a la ventana de mi cocina y se quedó completamente quieta, mirándome durante un minuto entero antes de irse volando.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'La paciencia de la garza',
          interpretation:
            'La garza es una maestra silenciosa de la quietud. Espera a la orilla del agua, sin que la corriente la inquiete, confiando en que lo que necesita llegará a su alcance. Cruzar su mirada en una mañana cualquiera puede sentirse como una invitación a bajar el ritmo y habitar tu propia vida con esa misma serenidad. Quizá algo en ti ha estado corriendo hacia una respuesta. La garza sugiere que la respuesta ya viene hacia ti, y que tu tarea es simplemente permanecer lo bastante presente para notarla. Hay dignidad en esperar cuando la espera se elige. Que esta visita te recuerde que la paciencia no es pasividad, y que observar con atención suave es también una forma de actuar.',
          reflectionQuestion: '¿En qué parte de tu vida quedarte quieta podría ser hoy lo más valiente?',
        },
      },
    },
  },
];
