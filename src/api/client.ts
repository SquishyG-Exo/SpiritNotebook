/**
 * Thin client for the two serverless functions in /api.
 *
 * Contract (shared with api/interpret.ts and api/unlock.ts):
 *
 *   POST /api/interpret
 *     headers: content-type: application/json, x-demo-passcode?: string
 *     body:    { text, category, subcategory?, language }
 *     200:     { kind: 'reading' | 'care', title, interpretation, reflection_question, language, model }
 *     4xx/5xx: { error: ErrorCode, message?: string, retryAfter?: number }
 *
 *   GET  /api/unlock          → { required: boolean }
 *   POST /api/unlock { code } → 200 { ok: true } | 401 { error: 'unauthorized' }
 */
import type { CategoryKey, LifeSituationKey } from '../../brand/categories';
import { readStorage, writeStorage } from '../lib/storage';
import type { Language, Reading } from '../state/types';

export type ApiErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'
  | 'network'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message?: string,
    public readonly retryAfter?: number,
  ) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
const PASSCODE_KEY = 'spirit.passcode';

export interface InterpretInput {
  text: string;
  category: CategoryKey;
  subcategory?: LifeSituationKey;
  language: Language;
}

interface InterpretResponse {
  kind: 'reading' | 'care';
  title: string;
  interpretation: string;
  reflection_question: string;
  language: Language;
  model?: string;
}

export function getStoredPasscode(): string | null {
  return readStorage(PASSCODE_KEY);
}

export function storePasscode(code: string | null): void {
  writeStorage(PASSCODE_KEY, code);
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError('network');
  }
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON body */
  }
  if (!response.ok) {
    const body = (payload ?? {}) as { error?: string; message?: string; retryAfter?: number };
    const code = (body.error ?? 'unknown') as ApiErrorCode;
    throw new ApiError(code, body.message, body.retryAfter);
  }
  return payload as T;
}

export async function requestInterpretation(input: InterpretInput): Promise<Reading> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const passcode = getStoredPasscode();
  if (passcode) headers['x-demo-passcode'] = passcode;

  const data = await request<InterpretResponse>('/api/interpret', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  return {
    kind: data.kind === 'care' ? 'care' : 'reading',
    title: data.title,
    interpretation: data.interpretation,
    reflectionQuestion: data.reflection_question,
    language: data.language ?? input.language,
    model: data.model,
  };
}

export async function getUnlockStatus(): Promise<{ required: boolean }> {
  return request<{ required: boolean }>('/api/unlock', { method: 'GET' });
}

/** Validates a passcode with the server and remembers it on success. */
export async function unlockWithPasscode(code: string): Promise<boolean> {
  try {
    await request<{ ok: true }>('/api/unlock', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    storePasscode(code);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'unauthorized') return false;
    throw error;
  }
}
