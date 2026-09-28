/// <reference types="node" />
import { createHash, timingSafeEqual } from 'node:crypto';

export const PASSCODE_HEADER = 'x-demo-passcode';

function digest(value: string): Buffer {
  return createHash('sha256').update(value.trim(), 'utf8').digest();
}

/**
 * Constant-time comparison. Hashing first gives timingSafeEqual two buffers of
 * equal length whatever was typed, so neither the content nor the length of the
 * passcode leaks through timing. Surrounding whitespace is ignored.
 */
export function passcodeMatches(expected: string, provided: unknown): boolean {
  if (typeof provided !== 'string') return false;
  return timingSafeEqual(digest(expected), digest(provided));
}

/** True when no passcode is configured, or the request carries the right one. */
export function hasValidPasscode(request: Request, passcode: string | undefined): boolean {
  if (!passcode) return true;
  return passcodeMatches(passcode, request.headers.get(PASSCODE_HEADER));
}
