import { vi } from 'vitest';

import type { Logger } from '../http';
import type { Reading } from '../schema';

export const IP = '203.0.113.7';

export const validBody = {
  text: '  I saw a heron standing perfectly still at the edge of the lake this morning.  ',
  category: 'animals',
  language: 'en',
};

export const sampleReading: Reading = {
  kind: 'reading',
  title: "The Heron's Patience",
  interpretation:
    'The heron you saw holds a lesson in stillness. It waits at the edge of the water without hurry, trusting that what it needs will come within reach. Perhaps something in you is being invited to wait the same way, alert but unhurried, at the edge of a change you can already sense.',
  reflection_question: 'Where in your life are you being asked to wait with patience?',
};

/** A Logger whose calls can be asserted and that keeps test output quiet. */
export function testLogger() {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() } satisfies Logger;
}

export function jsonRequest(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
  method = 'POST',
): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': IP, ...headers },
    body: JSON.stringify(body),
  });
}
