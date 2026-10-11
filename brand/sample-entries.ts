/**
 * Preloaded demo journal. Dates are relative to "today" (daysAgo, or monthDay
 * for a fixed calendar day) so the calendar always looks current. Each entry
 * ships in every language. `title` is the reader's own title; the feather and
 * the sea-door dream are left untitled on purpose, so the app falls back to
 * the reading's title.
 *
 * One person's story, newest first. In May she dreams of a small blue boat
 * (the client's own search example: "blue boat" / "barca azul"); some weeks
 * ago she sees that same blue boat in a harbor in Maine; this month the flower
 * shop she worked at for eleven years closes, and the signs around it keep
 * returning to the same images.
 *
 * Recurring motifs: see the tally in brand/insights.ts (keep it in sync).
 */
import type { SampleEntry } from '../src/state/types';

export const sampleEntries: SampleEntry[] = [
  {
    id: 'sample-gratitude',
    daysAgo: 0,
    time: '08:10',
    category: 'gratitude',
    content: {
      en: {
        title: 'Morning gratitude',
        text: 'Three small things this morning. The sunflowers I brought home from the shop on the last day are still standing tall on the kitchen table. My aunt’s lighthouse postcard is on the fridge now, right at eye level. And I drank my coffee on the back steps while the sky turned pink, with nowhere I had to be.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Gifts of an Unhurried Morning',
          interpretation:
            'What a gentle way to begin the day. Sunflowers that came home with you from the shop and are still standing tall, as if they were not quite ready to say goodbye. A postcard placed right at eye level, so that someone’s love greets you every time you pass the fridge. And coffee on the back steps under a pink sky, with nowhere you had to be.\n\n' +
            'None of these is big, and that is part of their beauty. Together they hold so much of what matters to you: the flowers you carried home, the people who think of you, and a morning that was all yours. Let yourself stay with this feeling a little longer.',
          reflectionQuestion: 'How could you give yourself one more unhurried moment like this today?',
        },
      },
      es: {
        title: 'Gratitud de la mañana',
        text: 'Tres cosas pequeñas esta mañana. Los girasoles que traje de la florería el último día siguen bien erguidos en la mesa de la cocina. La postal del faro que me mandó mi tía ya está en el refrigerador, a la altura de mis ojos. Y me tomé el café en los escalones de atrás mientras el cielo se ponía rosa, sin tener que ir a ningún lado.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'Regalos de una mañana sin prisa',
          interpretation:
            'Así da gusto empezar el día. Unos girasoles que se vinieron contigo de la florería y siguen bien erguidos, como si todavía no estuvieran listos para despedirse. Una postal puesta justo a la altura de tus ojos, para que el cariño de alguien te salude cada vez que pasas por el refrigerador. Y un café en los escalones de atrás, bajo un cielo rosa, sin tener que ir a ningún lado.\n\n' +
            'Ninguna de estas cosas es grande, y en eso está parte de su belleza. Juntas guardan mucho de lo que te importa: las flores que trajiste a casa, la gente que piensa en ti y una mañana que fue toda tuya. Date permiso para quedarte en esta sensación un ratito más.',
          reflectionQuestion: '¿Cómo podrías regalarte hoy otro momento sin prisa como este?',
        },
      },
    },
  },
  {
    id: 'sample-lighthouse',
    daysAgo: 1,
    time: '22:15',
    category: 'signs',
    content: {
      en: {
        title: 'Three lighthouses',
        text: 'Lighthouses, three times today. A mug at the thrift store, the page I opened to at random in a library book, and tonight an unexpected postcard from my aunt in Maine: a lighthouse on a rocky shore, and on the back, “Saw this and thought of you.”',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'Light at the Water’s Edge',
          interpretation:
            'Once might be chance. Three times in a single day, from a thrift store shelf to a library book to your own mailbox, starts to feel like a thread worth following. What makes this one so tender is where the thread ended: in your aunt’s handwriting, sent from Maine by someone who had no way of knowing the lighthouse had already found you twice.\n\n' +
            'A lighthouse stands exactly where the land ends and the water begins, at the edge between the known and the open. It never goes chasing ships or tells them where to go. It stays still, keeps its light on, and lets whoever is out on the water find their own way. Perhaps that is the image being offered to you: a way of staying steady while things around you move, and a reminder that you are seen, even from far away. Someone looked at a lighthouse on a rocky shore and thought of you. That kind of light carries a long way.',
          reflectionQuestion: 'Who has been a lighthouse for you, and what would you like them to know?',
        },
      },
      es: {
        title: 'Tres faros',
        text: 'Faros, tres veces hoy. Una taza en una tienda de segunda mano, la página que abrí al azar en un libro de la biblioteca y, esta noche, una postal inesperada de mi tía desde Maine: un faro sobre una costa rocosa, y atrás decía “Vi esto y me acordé de ti”.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'Luz a la orilla del agua',
          interpretation:
            'Una vez puede ser casualidad. Tres veces en un solo día, del estante de una tienda de segunda mano a un libro de la biblioteca y de ahí a tu propio buzón, ya empieza a parecer un hilo que vale la pena seguir. Lo que lo vuelve tan tierno es dónde terminó: en la letra de tu tía, en una postal enviada desde Maine por alguien que no tenía forma de saber que el faro ya te había encontrado dos veces.\n\n' +
            'Un faro se levanta justo donde termina la tierra y empieza el agua, en el borde entre lo conocido y lo abierto. No sale a perseguir barcos ni les dice por dónde ir. Se queda quieto, mantiene su luz encendida y deja que quien anda en el mar encuentre su propio camino. Quizá esa sea la imagen que se te ofrece: una manera de mantenerte firme mientras todo a tu alrededor se mueve, y el recordatorio de que alguien te ve, aun desde lejos. Alguien miró un faro sobre las rocas y pensó en ti. Esa clase de luz llega muy lejos.',
          reflectionQuestion: '¿Quién ha sido un faro para ti, y qué te gustaría que supiera?',
        },
      },
    },
  },
  {
    id: 'sample-heron',
    daysAgo: 3,
    time: '07:40',
    category: 'animals',
    favorite: true,
    content: {
      en: {
        title: 'Heron at the lake',
        text: 'First week without the shop, and I still wake up at five. This morning I walked down to the lake before sunrise, and a great blue heron was standing in the shallows, so still I thought it was a branch until it turned its head toward me. We watched each other until the sun came up.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Heron’s Patience',
          interpretation:
            'Your body still keeps the shop’s hours, waking you at five for mornings that no longer begin there. Today you gave those hours somewhere to go, and something was waiting for you at the water’s edge. The heron is a creature of the in-between. It lives with its feet in the water and the land at its back, belonging fully to neither, and yet perfectly at home. It is also a patient hunter: herons feed by waiting, motionless, until what they need comes within reach. They can be so still that, as you noticed, they are easy to mistake for part of the landscape.\n\n' +
            'In this first week without the shop, you may feel a little like that heron, standing in the shallows between one life and the next. Its quiet lesson is that this is not wasted time. Stillness is how the heron sees clearly. And you did not rush either: you stayed and watched until the sun came up, which suggests you already know more about patience than you think.',
          reflectionQuestion: 'What might these early, unclaimed mornings be making room for?',
        },
      },
      es: {
        title: 'La garza del lago',
        text: 'Primera semana sin la florería y sigo despertándome a las cinco. Esta mañana bajé al lago antes de que amaneciera, y había una garza grande, gris azulada, parada en la orilla con las patas en el agua, tan quieta que pensé que era una rama, hasta que volteó la cabeza hacia mí. Nos quedamos mirándonos hasta que salió el sol.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'La paciencia de la garza',
          interpretation:
            'Tu cuerpo sigue con el horario de la florería y te despierta a las cinco para unas mañanas que ya no empiezan allí. Hoy le diste a esas horas un lugar adonde ir, y a la orilla del agua algo te estaba esperando. La garza es un ser de umbrales. Vive con las patas en el agua y la tierra a la espalda, sin pertenecer del todo a ninguno de los dos mundos, y aun así está perfectamente en su sitio. Además, es una cazadora paciente: se alimenta esperando, inmóvil, hasta que lo que necesita se le acerca. Puede quedarse tan quieta que, como bien notaste, es fácil confundirla con parte del paisaje.\n\n' +
            'En esta primera semana sin la florería, quizá te sientas un poco como esa garza, con los pies en el agua entre una vida y la que sigue. Lo que ella enseña, sin decir nada, es que este no es tiempo perdido. La quietud es la forma en que la garza ve con claridad. Y tú tampoco te apuraste: te quedaste mirando hasta que salió el sol, señal de que sabes de paciencia más de lo que crees.',
          reflectionQuestion: '¿Para qué estarán abriendo espacio estas mañanas tempranas que ahora son solo tuyas?',
        },
      },
    },
  },
  {
    id: 'sample-last-day',
    daysAgo: 6,
    time: '21:40',
    category: 'life',
    subcategory: 'endings',
    content: {
      en: {
        title: 'Last day at the shop',
        text: 'Last day at the flower shop. After eleven years I turned the little sign on the door to CLOSED for the last time, and the evening light fell across the empty buckets like it was any other day. I cried in the car, but I also felt strangely light.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Other Side of the Sign',
          interpretation:
            'Eleven years of mornings live inside that small gesture. Your hand has turned that sign thousands of times, usually without a thought. Tonight you turned it knowing it was the last time. Endings deserve to be marked, and you marked this one with your own hands, at the door you knew by heart. The evening light falling across the empty buckets as if it were any other day is worth keeping too. Some things do not end when a chapter does: the light, the care in your hands, the eye that spent eleven years noticing what was beautiful.\n\n' +
            'Crying in the car and feeling strangely light are not a contradiction. Grief and relief often arrive together when we let go of something we loved, and neither one has to win. There is also one more detail hidden in that little sign. When the side facing the street says Closed, the side facing you, on the inside, says Open.',
          reflectionQuestion: 'On your side of the door, what would you like Open to mean now?',
        },
        note: 'The side facing me says Open. I don’t know to what yet, and for once that feels okay.',
      },
      es: {
        title: 'Último día en la florería',
        text: 'Último día en la florería. Después de once años volteé el letrerito de la puerta a CERRADO por última vez, y la luz del atardecer caía sobre las cubetas vacías como cualquier otro día. Lloré en el carro, pero también me sentí extrañamente ligera.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'El otro lado del letrero',
          interpretation:
            'En ese gesto tan pequeño caben once años de mañanas. Tu mano volteó ese letrero miles de veces, casi siempre sin pensarlo. Esta noche lo hiciste sabiendo que era la última vez. Los finales merecen ser marcados, y este lo marcaste tú, con tus propias manos, en esa puerta que te sabías de memoria. Vale la pena guardar también la imagen de la luz del atardecer sobre las cubetas vacías, como si fuera un día cualquiera. Hay cosas que no terminan cuando termina una etapa: la luz, el cuidado de tus manos, esa mirada que pasó once años descubriendo lo bello.\n\n' +
            'Llorar en el carro y, al mismo tiempo, sentir esa ligereza tan extraña no es una contradicción. El duelo y el alivio suelen llegar juntos cuando soltamos algo que amamos, y ninguno de los dos tiene que ganar. Y hay un detalle más, escondido en ese letrerito. Cuando el lado que mira a la calle dice Cerrado, el lado que te mira a ti, el de adentro, dice Abierto.',
          reflectionQuestion:
            'Desde tu lado de la puerta, ¿qué te gustaría que significara ahora la palabra Abierto?',
        },
        note: 'El lado que me mira a mí dice Abierto. Todavía no sé a qué, y por primera vez eso me da paz.',
      },
    },
  },
  {
    id: 'sample-feather',
    daysAgo: 10,
    time: '08:20',
    category: 'signs',
    hasPhoto: true,
    content: {
      en: {
        text: 'There was a small white feather on my doormat this morning, lying perfectly straight, as if someone had set it there on purpose. It was the morning we started packing up the shop. I took a picture before the wind could take it.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'One Feather at a Time',
          interpretation:
            'A feather is something a bird has let go of. Most birds shed their feathers a few at a time, so that new ones can grow in without the bird ever losing its ability to fly. Finding one on your doormat, on the very morning you began packing up the shop, is like being handed a gentle mirror. Letting go of a chapter does not have to happen all at once. It can happen one box, one shelf, one feather at a time, and you can keep flying while it does.\n\n' +
            'Where it landed matters too. A doormat sits right on the threshold, the small line between your home and the world, and in many folk traditions a white feather is read as a sign of peace, or of someone who loved you being close. You took a picture before the wind could take it. That may be the whole teaching of this morning: keep what is precious, and trust that the rest can be carried off lightly.',
          reflectionQuestion:
            'What could you let go of gently, one feather at a time, as you pack up this chapter?',
        },
      },
      es: {
        text: 'Esta mañana había una plumita blanca en el tapete de la entrada, perfectamente derecha, como si alguien la hubiera dejado ahí a propósito. Fue la mañana en que empezamos a empacar todo en la florería. Le tomé una foto antes de que se la llevara el viento.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'Pluma a pluma',
          interpretation:
            'Una pluma es algo que un pájaro ha soltado. La mayoría de las aves cambian sus plumas poco a poco, unas cuantas a la vez, para que las nuevas crezcan sin perder nunca la capacidad de volar. Encontrar una en el tapete de tu entrada, justo la mañana en que empezaste a empacar todo en la florería, es como recibir un espejo amable. Soltar una etapa no tiene que pasar de golpe. Puede ir sucediendo caja por caja, repisa por repisa, pluma a pluma, y mientras tanto puedes seguir volando.\n\n' +
            'También importa dónde cayó. El tapete de la entrada está justo en el umbral, esa pequeña línea entre tu casa y el mundo, y en muchas tradiciones populares una pluma blanca se entiende como señal de paz, o de que alguien que te quiso anda cerca. Le tomaste una foto antes de que se la llevara el viento. Puede que esa sea toda la enseñanza de esta mañana: guardar lo que es valioso y confiar en que lo demás puede irse con ligereza.',
          reflectionQuestion:
            '¿Qué podrías soltar con suavidad, pluma a pluma, mientras cierras esta etapa?',
        },
      },
    },
  },
  {
    id: 'sample-eleven',
    daysAgo: 15,
    time: '13:05',
    category: 'numbers',
    content: {
      en: {
        title: '11:11 everywhere',
        text: '11:11 on the microwave last night, 11:11 on the dashboard this morning, and just now my lunch came to exactly $11.11. All in the same week Rosa told us she’s closing the flower shop, where I’ve worked for eleven years. I’m half laughing and half paying attention.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'Eleven at the Threshold',
          interpretation:
            'Eleven is a simple shape: two upright lines standing side by side, like the posts of a doorway. That may be why so many people who keep noticing it come to see it as a number of thresholds, the kind that shows up when one room of life is closing and the next has not yet opened. Finding it on the microwave, the dashboard and a lunch receipt within a single day is the sort of repetition that makes anyone look twice.\n\n' +
            'What stands out is the timing. The number arrived in the same week you learned the flower shop is closing, and it echoes the eleven years you have given it. Rather than a prediction, it may be a bookmark, a quiet way of marking this page so you do not rush past it. Half laughing and half paying attention is a wise way to hold a sign. Keep both. Humor keeps the load light, attention helps you see clearly, and together they make good company on the way through this doorway.',
          reflectionQuestion:
            'What from these eleven years do you most want to carry with you through the door?',
        },
      },
      es: {
        title: '11:11 por todas partes',
        text: '11:11 en el microondas anoche, 11:11 en el reloj del carro esta mañana, y hace un rato el almuerzo me costó exactamente $11.11. Todo en la misma semana en que Rosa nos dijo que va a cerrar la florería, donde llevo once años trabajando. Una parte de mí se ríe y la otra presta mucha atención.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'El once en el umbral',
          interpretation:
            'El once tiene una forma sencilla: dos líneas verticales, una al lado de la otra, como los dos lados del marco de una puerta. Tal vez por eso tanta gente que lo sigue viendo termina entendiéndolo como un número de umbrales, de esos que aparecen cuando una etapa se está cerrando y la siguiente todavía no se abre. Encontrarlo en el microondas, en el reloj del carro y en la cuenta del almuerzo en un mismo día es el tipo de repetición que hace que cualquiera mire dos veces.\n\n' +
            'Lo que más llama la atención es el momento. El número llegó la misma semana en que supiste que la florería va a cerrar, y hace eco de los once años que le has dedicado. Más que una predicción, puede ser un separador entre las páginas, una forma callada de marcar este capítulo para que no pases de largo. Reírte y prestar atención a la vez es una manera sabia de recibir una señal. Quédate con las dos cosas: el humor aligera la carga, la atención te ayuda a ver con claridad, y juntos son buena compañía para cruzar esta puerta.',
          reflectionQuestion: '¿Qué de estos once años quieres llevarte contigo al cruzar la puerta?',
        },
      },
    },
  },
  {
    id: 'sample-sea-door',
    daysAgo: 21,
    time: '06:50',
    category: 'dreams',
    content: {
      en: {
        text: 'I dreamed I was back in my grandmother’s house, but the back door opened straight onto the sea. The water was calm and silver, like the light just before sunrise, and I stood in the doorway for a long time, not sure if I was allowed to step out.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Door to the Sea',
          interpretation:
            'A grandmother’s house often stands, in dreams, for the place where we first learned who we are: the smells, the rules, the love that shaped us. In your dream that familiar house is still there, but its back door no longer opens onto the yard. It opens onto the sea. The known and the vast are suddenly one step apart.\n\n' +
            'Notice how gentle the scene is. The water is calm, the light is silver, and the hour is that quiet stretch just before sunrise, when the day has not yet decided what it will be. Nothing in the dream is pushing you, and standing still in a doorway is not the same as being stuck. It is a kind place to pause, with one foot in what formed you and your eyes on what is opening. The only thing missing is permission, and dreams rarely hand us a signed permission slip. Perhaps the invitation is simply to notice that the door is already open, and that the sea, calm and silver, is in no hurry.',
          reflectionQuestion:
            'Whose permission are you still waiting for, and what would change if you gave it to yourself?',
        },
        note: 'My grandmother never asked anyone’s permission for anything. Maybe I’ve been waiting for someone to tell me it’s okay to want something new.',
      },
      es: {
        text: 'Soñé que estaba otra vez en la casa de mi abuela, pero la puerta de atrás daba directo al mar. El agua estaba quieta y plateada, como la luz que hay justo antes del amanecer, y yo me quedé un buen rato en la puerta, sin saber si tenía permiso para salir.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'La puerta que da al mar',
          interpretation:
            'En los sueños, la casa de una abuela suele representar el lugar donde aprendimos quiénes somos: los olores, las costumbres, el cariño que nos formó. En tu sueño esa casa sigue en pie, pero la puerta de atrás ya no da al patio. Da al mar. Lo conocido y lo inmenso quedan, de pronto, a un solo paso.\n\n' +
            'Fíjate en lo suave que es la escena. El agua está en calma, la luz es plateada y es esa hora quieta de antes del amanecer, cuando el día todavía no ha decidido qué va a ser. Nada en el sueño te empuja, y detenerte en una puerta no es lo mismo que estancarte. Es un buen lugar para hacer una pausa, con un pie en lo que te formó y la mirada en lo que se abre. Lo único que falta es el permiso, y los sueños casi nunca nos lo dan por escrito. Tal vez la invitación sea darte cuenta de que la puerta ya está abierta, y de que el mar, tranquilo y plateado, no tiene ninguna prisa.',
          reflectionQuestion: '¿De quién sigues esperando permiso, y qué cambiaría si te lo dieras tú?',
        },
        note: 'Mi abuela nunca le pidió permiso a nadie para nada. Creo que llevo tiempo esperando que alguien me diga que está bien querer algo nuevo.',
      },
    },
  },
  {
    id: 'sample-saw-blue-boat',
    daysAgo: 45,
    category: 'signs',
    hasPhoto: true,
    content: {
      en: {
        title: 'Saw a blue boat',
        text: 'A few days in Maine with my aunt. This morning, walking along the harbor, I saw a little blue boat tied up at the dock, rocking gently, the exact same blue as the boat in my dream, the one where I felt so light and free. I stood there so long that a fisherman asked if I was lost. I wasn’t. I just didn’t want to forget it.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'The Same Blue',
          interpretation:
            'After visiting you in a dream, the boat found you in daylight: tied to a dock in a harbor you were only passing through, painted the exact blue you remembered. Out of every boat in that harbor, this was the one that stopped you. When an image from the night turns up in the waking world like this, it is the kind of everyday sign that asks for a second look.\n\n' +
            'In your dream, a boat of that same blue held you while you felt light and free. Here it was resting, tied up and rocking gently, as if it had been waiting for you to walk by. James Redfield wrote about coincidences as small signposts that invite our attention, and you gave this one yours: you stood still long enough for a stranger to wonder whether you were lost. You were not lost. You were noticing. Perhaps the boat came to remind you that the lightness you felt in that dream is still yours to return to.',
          reflectionQuestion: 'Where in your everyday life could you make a little room for that lightness?',
        },
      },
      es: {
        title: 'Vi una barca azul',
        text: 'Unos días en Maine con mi tía. Esta mañana, caminando por el puerto, vi una pequeña barca azul amarrada al muelle, meciéndose despacio, del mismo azul exacto que la barca de mi sueño, ese en el que me sentía tan ligera y tan libre. Me quedé mirándola tanto rato que un pescador me preguntó si estaba perdida. No lo estaba. Solo quería grabármelo bien.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'El mismo azul',
          interpretation:
            'Después de visitarte en un sueño, la barca te encontró a plena luz del día: amarrada a un muelle en un puerto por el que solo estabas de paso, pintada del mismo azul que recordabas. De todas las barcas de ese puerto, fue esa la que te detuvo. Cuando una imagen de la noche aparece así en el mundo despierto, es el tipo de señal cotidiana que pide una segunda mirada.\n\n' +
            'En tu sueño, una barca de ese mismo azul te sostenía mientras te sentías ligera y libre. Aquí estaba en reposo, amarrada y meciéndose despacio, como si te hubiera estado esperando. James Redfield escribió sobre las coincidencias como pequeñas señales en el camino que nos invitan a prestar atención, y tú le diste a esta toda la tuya: te quedaste quieta tanto rato que un desconocido pensó que estabas perdida. No estabas perdida. Estabas observando. Quizá la barca vino a recordarte que esa ligereza que sentiste en el sueño sigue siendo tuya, y que puedes volver a ella.',
          reflectionQuestion: '¿En qué parte de tu vida diaria podrías hacerle un poco de espacio a esa ligereza?',
        },
      },
    },
  },
  {
    id: 'sample-blue-boat',
    monthDay: '05-17',
    // Always before 'sample-saw-blue-boat' (45 days ago), whatever year the demo runs in.
    minDaysAgo: 60,
    time: '06:40',
    category: 'dreams',
    hasPhoto: true,
    favorite: true,
    content: {
      en: {
        title: 'Blue boat',
        text: 'I dreamed I was sitting in a small blue boat on clear, calm water, so clear I could see pebbles on the bottom. There were no oars and I wasn’t steering, but I wasn’t afraid. The sun was going down, the water turned gold and pink, and I felt light and free, lighter than I’ve felt in years.',
        reading: {
          kind: 'reading',
          language: 'en',
          title: 'A Boat Without Oars',
          interpretation:
            'Water in dreams often mirrors the inner world, and yours was calm and clear enough to see all the way to the bottom. That kind of clarity is worth noticing: nothing murky, nothing hidden, just a surface you could trust. And you were not swimming or struggling to stay afloat. You were held, in a small boat the color of sky and open sea.\n\n' +
            'There were no oars and you were not steering, yet there was no fear. That may be the heart of the dream: a taste of what it feels like to stop pushing and let yourself be carried for a while. Robert A. Johnson, who wrote beautifully about dreamwork, suggested meeting each dream image as a part of yourself, so you might ask which part of you is this little blue boat, buoyant and steady, able to float without effort. Keep that lightness close. Sometimes a dream lets us feel something before our waking life has found room for it.',
          reflectionQuestion: 'What would it feel like to stop steering for a while and let something carry you?',
        },
      },
      es: {
        title: 'La barca azul',
        text: 'Soñé que iba sentada en una pequeña barca azul sobre un agua clara y tranquila, tan clara que se veían las piedritas del fondo. No había remos y nadie la dirigía, pero no tenía miedo. El sol se estaba poniendo, el agua se volvió dorada y rosa, y me sentí ligera y libre, más ligera que en muchos años.',
        reading: {
          kind: 'reading',
          language: 'es',
          title: 'Una barca sin remos',
          interpretation:
            'En los sueños, el agua suele reflejar el mundo interior, y la tuya estaba tan tranquila y tan clara que se veía hasta el fondo. Vale la pena fijarse en esa claridad: nada turbio, nada escondido, solo una superficie en la que podías confiar. Y no estabas nadando ni luchando por mantenerte a flote. Algo te sostenía: una pequeña barca del color del cielo y del mar abierto.\n\n' +
            'No había remos y nadie la dirigía, y aun así no sentías miedo. Quizá ese sea el corazón del sueño: probar lo que se siente dejar de empujar y permitir que algo te lleve por un rato. Robert A. Johnson, que escribió con mucha belleza sobre el trabajo con los sueños, proponía mirar cada imagen de un sueño como una parte de uno mismo; así que podrías preguntarte qué parte de ti es esta barquita azul, ligera y firme, capaz de flotar sin esfuerzo. Atesora esa ligereza. A veces un sueño nos deja sentir algo antes de que el día a día le haga espacio.',
          reflectionQuestion: '¿Cómo se sentiría soltar el timón por un rato y dejar que algo te lleve?',
        },
      },
    },
  },
];
