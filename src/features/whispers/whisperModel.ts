import { whisperById, whisperOfTheDay, whispers, type Whisper } from '../../../brand/whispers';

/** The whisper for /whispers?id=…, else the whisper of the day. */
export function resolveWhisper(id: string | undefined, today: Date): Whisper {
  return (id ? whisperById(id) : undefined) ?? whisperOfTheDay(today);
}

/** A random whisper other than the current one, so "Another whisper" never repeats itself. */
export function pickAnother(currentId: string, random: () => number = Math.random, list: readonly Whisper[] = whispers): Whisper {
  const others = list.filter((whisper) => whisper.id !== currentId);
  if (others.length === 0) return list[0];
  return others[Math.min(others.length - 1, Math.floor(random() * others.length))];
}
