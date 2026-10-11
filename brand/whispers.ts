/**
 * Whispers of Wisdom: short uplifting messages, shown one at a time.
 *
 * Every whisper is original writing (at most 28 words in each language).
 * `inspiredBy` names the teacher or work whose ideas it echoes (shown as
 * "In the spirit of …"); it is never a quote, and none imitates a famous line.
 * Two thirds are inspired by the Wellsprings in brand/voice.md, two per
 * teacher; the rest are unattributed, in the manner of folk wisdom.
 *
 * Order matters for whisperOfTheDay: an attributed, attributed, folk rhythm,
 * and a teacher's two whispers sit 18 places apart, so the same name never
 * comes back within 17 days.
 */
import type { Language } from '../src/state/types';

export interface Whisper {
  id: string;
  text: Record<Language, string>;
  inspiredBy?: { author: string; work?: string };
}

const TOLLE = 'Eckhart Tolle';
const CHODRON = { author: 'Pema Chödrön', work: 'The Wisdom of No Escape' };
const NHAT_HANH = { author: 'Thich Nhat Hanh', work: 'The Miracle of Mindfulness' };
const SINGER = { author: 'Michael A. Singer', work: 'The Untethered Soul' };
const ZUKAV = { author: 'Gary Zukav', work: 'The Seat of the Soul' };
const CHOPRA = { author: 'Deepak Chopra', work: 'The Seven Spiritual Laws of Success' };
const REDFIELD = { author: 'James Redfield', work: 'The Celestine Prophecy' };
const CAMERON = { author: 'Julia Cameron', work: 'The Artist’s Way' };
const ESTES = { author: 'Clarissa Pinkola Estés', work: 'Women Who Run With the Wolves' };
const JOHNSON = { author: 'Robert A. Johnson', work: 'Inner Work' };
const NORBU = { author: 'Chögyal Namkhai Norbu', work: 'Dream Yoga and the Practice of Natural Light' };
const MYSS = 'Caroline Myss';

export const whispers: Whisper[] = [
  {
    id: 'w-signs',
    text: {
      en: 'The song on the radio, the name you overheard, the friend who called just as you were thinking of them: follow these threads with curiosity.',
      es: 'La canción en la radio, el nombre que escuchaste de pasada, esa persona que llamó justo cuando pensabas en ella: sigue esos hilos con curiosidad.',
    },
    inspiredBy: REDFIELD,
  },
  {
    id: 'w-seed',
    text: {
      en: 'A seed does its quiet work in the dark long before anyone sees a leaf. Trust what is growing in you.',
      es: 'Una semilla hace su trabajo callado en la oscuridad mucho antes de que alguien vea una hoja. Confía en lo que está creciendo en ti.',
    },
  },
  {
    id: 'w-start-where',
    text: {
      en: 'You don’t need to become calmer, wiser, or better before you begin. Your restless, imperfect self is the very one who can take the first step.',
      es: 'No hace falta más calma ni más sabiduría para empezar. Tal como eres hoy, con tus prisas y tus dudas, ya puedes dar el primer paso.',
    },
    inspiredBy: CHODRON,
  },
  {
    id: 'w-dream-figures',
    text: {
      en: 'Every figure in your dream may be a part of you. Ask the stranger what they want, and listen for the answer in your own voice.',
      es: 'Cada figura de tus sueños puede ser una parte de ti. Pregúntale al desconocido qué quiere, y fíjate si la respuesta llega con tu propia voz.',
    },
    inspiredBy: JOHNSON,
  },
  {
    id: 'w-feather',
    text: {
      en: 'A feather on your path weighs almost nothing, yet it can change a whole morning. Never underestimate a small sign.',
      es: 'Una pluma en tu camino casi no pesa nada, y aun así puede cambiarte la mañana entera. Nunca subestimes una señal pequeña.',
    },
  },
  {
    id: 'w-the-listener',
    text: {
      en: 'Notice the voice in your head narrating, worrying, rehearsing. Then notice that something in you is listening. That quiet awareness is closer to who you are.',
      es: 'Observa la voz en tu cabeza que narra, se preocupa y ensaya. Algo en ti la está escuchando: esa conciencia callada se parece más a ti.',
    },
    inspiredBy: SINGER,
  },
  {
    id: 'w-morning-pages',
    text: {
      en: 'Before the day starts talking, fill three pages by hand with whatever is in you. No one has to read them. They simply clear the way.',
      es: 'Antes de que el día empiece a hablar, llena tres páginas a mano con lo que traigas dentro. Nadie tiene que leerlas. Solo despejan el camino.',
    },
    inspiredBy: CAMERON,
  },
  {
    id: 'w-bread',
    text: {
      en: 'Bread rises in its own time, and so do hearts. Cover what is mending with something warm, and let it be.',
      es: 'El pan sube a su tiempo, y los corazones también. Cubre con algo tibio lo que está sanando, y déjalo reposar.',
    },
  },
  {
    id: 'w-intention',
    text: {
      en: 'Before you speak, pause and ask what you truly intend. Words chosen from love land very differently from words chosen from fear.',
      es: 'Antes de hablar, haz una pausa y pregúntate cuál es tu verdadera intención. Lo que nace del amor llega muy distinto de lo que nace del miedo.',
    },
    inspiredBy: ZUKAV,
  },
  {
    id: 'w-falling-asleep',
    text: {
      en: 'As you drift toward sleep, rest in a soft, clear awareness and set a gentle wish to notice your dreams. The night can be a practice too.',
      es: 'Mientras el sueño te va venciendo, descansa en una atención suave y clara, con el deseo tranquilo de notar tus sueños. La noche también puede ser una práctica.',
    },
    inspiredBy: NORBU,
  },
  {
    id: 'w-ripple',
    text: {
      en: 'A kind word is a pebble dropped in still water. You may never see the farthest ripple, but it travels all the same.',
      es: 'Una palabra amable es una piedrita que cae en agua quieta. Quizá nunca veas la onda más lejana, pero llega igual.',
    },
  },
  {
    id: 'w-small-gifts',
    text: {
      en: 'Give something small today: a kind word, your full attention, a little help nobody asked for. Then let yourself receive just as freely.',
      es: 'Regala algo pequeño hoy: una palabra amable, tu atención completa, una ayuda que nadie te pidió. Y después permítete recibir con la misma facilidad.',
    },
    inspiredBy: CHOPRA,
  },
  {
    id: 'w-archetypes',
    text: {
      en: 'Notice the roles you play: caretaker, rebel, seeker, storyteller. Each carries a gift and a shadow. Which one is asking for your attention today?',
      es: 'Observa los papeles que asumes: quien cuida, quien se rebela, quien busca, quien cuenta historias. Cada uno trae un don y una sombra. ¿Cuál te llama hoy?',
    },
    inspiredBy: { author: MYSS, work: 'Sacred Contracts' },
  },
  {
    id: 'w-tree',
    text: {
      en: 'A tree does not ask the wind to stop. It bends, holds on to its roots, and is still standing in the morning.',
      es: 'El árbol no le pide al viento que se detenga. Se inclina, se aferra a sus raíces y amanece todavía de pie.',
    },
  },
  {
    id: 'w-need-to-be-right',
    text: {
      en: 'The next time you feel the urge to win a small argument, let it go. Notice the peace that opens when you no longer need to be right.',
      es: 'La próxima vez que quieras ganar una pequeña discusión, suéltala. Fíjate en la paz que llega cuando ya no necesitas tener la razón.',
    },
    inspiredBy: { author: TOLLE, work: 'A New Earth' },
  },
  {
    id: 'w-gather-the-bones',
    text: {
      en: 'Gather the scattered pieces of something you once loved, like a song or an old craft, and sing over them softly. What seemed lost can breathe again.',
      es: 'Reúne los pedazos dispersos de algo que amaste, como una canción o un oficio olvidado, y cántales bajito. Lo que parecía perdido puede volver a respirar.',
    },
    inspiredBy: ESTES,
  },
  {
    id: 'w-window',
    text: {
      en: 'Some answers only arrive once you stop chasing them. Sit by a window for a while and let the question rest in your lap.',
      es: 'Algunas respuestas solo llegan cuando dejas de perseguirlas. Siéntate un rato junto a la ventana y deja que la pregunta descanse en tu regazo.',
    },
  },
  {
    id: 'w-three-breaths',
    text: {
      en: 'Three slow breaths can bring you back to yourself. Follow each one all the way in and all the way out, as if nothing else mattered just now.',
      es: 'Tres respiraciones lentas pueden traerte de vuelta a ti. Acompaña cada una hasta el fondo y de regreso, como si nada más importara en este momento.',
    },
    inspiredBy: NHAT_HANH,
  },
  {
    id: 'w-chance-meeting',
    text: {
      en: 'When you cross paths with someone unexpectedly, linger a little. Ask a question. An ordinary conversation can carry just the message you needed.',
      es: 'Cuando te cruces con alguien de forma inesperada, quédate un poco más. Haz una pregunta. Una conversación cualquiera puede traerte justo el mensaje que necesitabas.',
    },
    inspiredBy: REDFIELD,
  },
  {
    id: 'w-old-hands',
    text: {
      en: 'Old hands know things no book can teach. Today, cook, mend, or plant something slowly, and let your own hands remember.',
      es: 'Las manos de antes saben cosas que ningún libro enseña. Hoy cocina, remienda o siembra algo despacio, y deja que tus manos recuerden.',
    },
  },
  {
    id: 'w-stay-with-it',
    text: {
      en: 'When a feeling is uncomfortable, you don’t have to run from it. Sit beside it with curiosity, the way you would keep a frightened friend company.',
      es: 'Cuando un sentimiento te incomoda, no tienes que huir de él. Siéntate a su lado con curiosidad, como acompañarías a alguien querido que tiene miedo.',
    },
    inspiredBy: CHODRON,
  },
  {
    id: 'w-honor-the-dream',
    text: {
      en: 'When a dream moves you, honor it with a small act in waking life: light a candle, walk by water, draw the image that stayed with you.',
      es: 'Cuando un sueño te conmueva, hónralo con un pequeño gesto durante el día: enciende una vela, camina junto al agua, dibuja la imagen que se quedó contigo.',
    },
    inspiredBy: JOHNSON,
  },
  {
    id: 'w-fallow',
    text: {
      en: 'Fields rest through the winter so they can feed the spring. Your quiet seasons are not wasted time.',
      es: 'Los campos descansan en invierno para poder alimentar la primavera. Tus temporadas tranquilas no son tiempo perdido.',
    },
  },
  {
    id: 'w-open-heart',
    text: {
      en: 'When an old hurt stirs, try relaxing around it instead of tightening. Let it move through you like a wave, and keep your heart open.',
      es: 'Cuando se despierte una herida vieja, intenta relajarte en lugar de cerrarte. Deja que pase por ti como una ola y mantén abierto el corazón.',
    },
    inspiredBy: SINGER,
  },
  {
    id: 'w-artist-date',
    text: {
      en: 'This week, take your creative self on a small outing alone: a museum, a fabric store, a new path in the park. Delight refills the well.',
      es: 'Esta semana, regálale a tu lado creativo una salida a solas: un museo, una tienda de telas, un sendero nuevo. La alegría vuelve a llenar el pozo.',
    },
    inspiredBy: CAMERON,
  },
  {
    id: 'w-river',
    text: {
      en: 'Rivers never run in a straight line, and yet they find the sea. Your winding path is still your path.',
      es: 'Los ríos nunca corren en línea recta, y aun así encuentran el mar. Tu camino con curvas sigue siendo tu camino.',
    },
  },
  {
    id: 'w-quiet-power',
    text: {
      en: 'Real power is quiet. It is the moment your choices line up with what your soul cares about, and you no longer need to prove anything.',
      es: 'El verdadero poder es silencioso. Llega cuando tus decisiones se alinean con lo que le importa a tu alma y ya no necesitas demostrarle nada a nadie.',
    },
    inspiredBy: ZUKAV,
  },
  {
    id: 'w-is-this-a-dream',
    text: {
      en: 'Now and then today, ask yourself softly: could this be a dream? Sensing the dreamlike quality of the day can help you wake up within your dreams.',
      es: 'Hoy, de vez en cuando, pregúntate: ¿y si esto fuera un sueño? Notar lo onírico del día puede ayudarte a despertar dentro de tus sueños.',
    },
    inspiredBy: NORBU,
  },
  {
    id: 'w-candle',
    text: {
      en: 'Light a candle tonight for someone you miss. A small flame can hold a great deal of love.',
      es: 'Enciende una vela esta noche por alguien que extrañas. Una llama pequeña puede guardar muchísimo amor.',
    },
  },
  {
    id: 'w-less-pushing',
    text: {
      en: 'Notice where you are straining against the day. Accept this moment as it is, and see how much flows once you stop pushing.',
      es: 'Nota dónde estás forcejeando con el día. Acepta este momento tal como es y mira cuántas cosas fluyen cuando dejas de empujar.',
    },
    inspiredBy: CHOPRA,
  },
  {
    id: 'w-call-it-back',
    text: {
      en: 'Notice where your energy goes each day. Loosening your grip on an old grievance can bring some of it back to the life you are living now.',
      es: 'Fíjate adónde se va tu energía cada día. Soltar un poco un viejo rencor puede devolver parte de ella a la vida que estás viviendo hoy.',
    },
    inspiredBy: { author: MYSS, work: 'Anatomy of the Spirit' },
  },
  {
    id: 'w-first-light',
    text: {
      en: 'Even the longest night ends the same way, with a thin line of light at the edge of the sky. Watch for yours.',
      es: 'Hasta la noche más larga termina igual: con una línea delgada de luz en el borde del cielo. Busca la tuya.',
    },
  },
  {
    id: 'w-presence',
    text: {
      en: 'Yesterday and tomorrow can wait for one breath. Feel your feet on the floor and the air on your skin: this is where your life is happening.',
      es: 'El ayer y el mañana pueden esperar una respiración. Siente tus pies en el suelo y el aire en la piel: aquí es donde sucede tu vida.',
    },
    inspiredBy: { author: TOLLE, work: 'The Power of Now' },
  },
  {
    id: 'w-wild-knowing',
    text: {
      en: 'Beneath all the shoulds lives a part of you that knows its way like a wolf knows the forest. Listen for its quiet, sure nudge.',
      es: 'Debajo de tantos “debería” vive una parte de ti que conoce el camino como el lobo conoce el bosque. Escucha su llamado suave y seguro.',
    },
    inspiredBy: ESTES,
  },
  {
    id: 'w-moon',
    text: {
      en: 'The moon is never in a hurry, and still it moves whole oceans. Go gently today; slow is not the same as small.',
      es: 'La luna nunca tiene prisa, y aun así mueve océanos enteros. Hoy ve con calma: despacio no es lo mismo que poco.',
    },
  },
  {
    id: 'w-one-cup',
    text: {
      en: 'When you wash a cup, let that be all you do: the warm water, the curve of the rim, your two hands. Nothing else needs you right now.',
      es: 'Cuando laves una taza, que eso sea todo lo que hagas: el agua tibia, la curva del borde, tus dos manos. Nada más te necesita ahora.',
    },
    inspiredBy: NHAT_HANH,
  },
];

/** The same whisper all day, a new one tomorrow. */
/** One whisper per calendar day. Counted on calendar dates, so daylight saving never shifts the change past midnight. */
export function whisperOfTheDay(date: Date = new Date()): Whisper {
  const year = date.getFullYear();
  const dayOfYear = (Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 0)) / 86_400_000;
  return whispers[dayOfYear % whispers.length];
}

export const whisperById = (id: string): Whisper | undefined => whispers.find((w) => w.id === id);
