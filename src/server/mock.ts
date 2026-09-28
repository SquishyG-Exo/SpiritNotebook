import type { BrandLanguage } from '../../brand/config';
import { UpstreamError, type ModelCall } from './model';
import type { Reading } from './schema';

/**
 * MOCK_AI=true (local development only): canned readings, no API call.
 * Put a trigger anywhere in the entry text to exercise the other paths:
 *   mock:care   the crisis response
 *   mock:error  a 502 upstream_error
 *   mock:slow   a 6 second wait instead of 1.2 seconds
 */
export const MOCK_MODEL = 'mock';
export const MOCK_ADVISOR_MODEL = 'mock-advisor';
export const MOCK_DELAY_MS = 1200;
export const MOCK_ADVISOR_DELAY_MS = 2600;
export const MOCK_SLOW_DELAY_MS = 6000;

export type Sleep = (ms: number) => Promise<void>;

export const sleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const READINGS: Record<BrandLanguage, Reading> = {
  en: {
    kind: 'reading',
    title: 'A Quiet Invitation',
    interpretation:
      'What you wrote carries the feeling of something asking to be noticed rather than solved. Moments like this often arrive when a part of you is ready to slow down and listen more closely. Stay for a moment with the details that lingered after it happened: the light, the timing, the small feeling in your chest. They may be less a message from outside than a mirror, reflecting a hope or a question you have been carrying quietly for a while.\n\nMany traditions treat such moments as thresholds, places where the ordinary thins a little and attention itself becomes a kind of listening. You do not need to know yet what it means. Let it keep you company today, and notice what softens or stirs when you stop trying to explain it.',
    reflection_question:
      'What part of this moment are you still carrying, and what might it be asking of you?',
  },
  es: {
    kind: 'reading',
    title: 'Una invitación silenciosa',
    interpretation:
      'Lo que escribiste tiene la sensación de algo que pide ser notado más que resuelto. Momentos así suelen llegar cuando una parte de ti está lista para ir más despacio y escuchar con más atención. Quédate un rato con los detalles que se quedaron contigo: la luz, el momento exacto, esa pequeña sensación en el pecho. Quizá sean menos un mensaje de afuera y más un espejo que refleja una esperanza o una pregunta que llevas en silencio desde hace tiempo.\n\nMuchas tradiciones ven estos momentos como umbrales, lugares donde lo cotidiano se vuelve un poco más delgado y la atención misma se convierte en una forma de escucha. No necesitas saber todavía qué significa. Deja que te acompañe hoy y observa qué se suaviza o qué se mueve en ti cuando dejas de intentar explicarlo.',
    reflection_question: '¿Qué parte de este momento sigues llevando contigo, y qué podría estar pidiéndote?',
  },
};

const CARE: Record<BrandLanguage, Reading> = {
  en: {
    kind: 'care',
    title: 'You Deserve Support',
    interpretation:
      'Thank you for trusting this notebook with something so heavy. What you are feeling matters, and you do not have to carry it alone. This notebook is not able to help with this, and you deserve real support right now. In the United States you can call or text 988 to reach the Suicide & Crisis Lifeline at any hour, and if you are in immediate danger, please call 911. If you are outside the US, please contact your local emergency services.\n\nFor this moment, take one slow breath and let your feet rest on the ground beneath you.',
    reflection_question: 'Is there one person you could reach out to today?',
  },
  es: {
    kind: 'care',
    title: 'Mereces apoyo',
    interpretation:
      'Gracias por confiarle a este cuaderno algo tan pesado. Lo que sientes importa, y no tienes que cargarlo en soledad. Este cuaderno no puede ayudarte con esto, y mereces apoyo real ahora mismo. En Estados Unidos puedes llamar o enviar un mensaje de texto al 988, la Línea de Prevención del Suicidio y Crisis, a cualquier hora y con atención en español. Si estás en peligro inmediato, llama al 911. Si estás fuera de Estados Unidos, comunícate con los servicios de emergencia de tu país.\n\nPor ahora, respira despacio una vez y deja que tus pies descansen sobre el suelo.',
    reflection_question: '¿Hay una persona a la que podrías llamar o escribirle hoy?',
  },
};

const ADVICE: Record<BrandLanguage, string> = {
  en: 'Lead with the stillness of the moment rather than its symbolism; keep the tone warm and unhurried, and avoid predicting anything.',
  es: 'Parte de la quietud del momento más que de su simbolismo; mantén un tono cálido y sin prisa, y evita predecir nada.',
};

export function createMockModel(wait: Sleep = sleep): ModelCall {
  return async ({ input }) => {
    const text = input.text.toLowerCase();
    const advisor = input.mode === 'advisor';
    await wait(text.includes('mock:slow') ? MOCK_SLOW_DELAY_MS : advisor ? MOCK_ADVISOR_DELAY_MS : MOCK_DELAY_MS);
    if (text.includes('mock:error')) throw new UpstreamError('other', 'mock:error requested');
    const source = text.includes('mock:care') ? CARE : READINGS;
    if (advisor) {
      return {
        type: 'ok',
        output: source[input.language],
        model: MOCK_MODEL,
        advisor: { requested: true, consulted: true, model: MOCK_ADVISOR_MODEL },
        advice: ADVICE[input.language],
      };
    }
    return { type: 'ok', output: source[input.language], model: MOCK_MODEL };
  };
}
