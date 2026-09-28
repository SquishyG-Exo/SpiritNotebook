import { describe, expect, it } from 'vitest';

import { clientIp, isAllowedOrigin, json, readJsonBody, route } from '../http';
import { testLogger } from './helpers';

const ENDPOINT = 'http://localhost:3000/api/interpret';

describe('clientIp', () => {
  it('uses the first x-forwarded-for hop, then x-real-ip, then "unknown"', () => {
    const ip = (headers: Record<string, string>) => clientIp(new Request(ENDPOINT, { headers }));
    expect(ip({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1', 'x-real-ip': '10.0.0.2' })).toBe(
      '203.0.113.7',
    );
    expect(ip({ 'x-real-ip': '10.0.0.2' })).toBe('10.0.0.2');
    expect(ip({})).toBe('unknown');
  });
});

describe('isAllowedOrigin', () => {
  it('allows http://localhost on any port and the configured origins only', () => {
    expect(isAllowedOrigin('http://localhost:8081', [])).toBe(true);
    expect(isAllowedOrigin('http://localhost', [])).toBe(true);
    expect(isAllowedOrigin('https://localhost:8081', [])).toBe(false);
    expect(isAllowedOrigin('http://localhost.evil.example', [])).toBe(false);
    expect(isAllowedOrigin('http://127.0.0.1:8081', [])).toBe(false);
    expect(isAllowedOrigin('https://preview.example.com', ['https://preview.example.com'])).toBe(true);
    expect(isAllowedOrigin(null, [])).toBe(false);
  });
});

describe('route', () => {
  const handler = route({ methods: ['POST'], allowedOrigins: ['https://preview.example.com'] }, async () =>
    json(200, { ok: true }),
  );

  it('answers a localhost preflight with CORS headers', async () => {
    const response = await handler(
      new Request(ENDPOINT, {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:8081',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type, x-demo-passcode',
        },
      }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:8081');
    expect(response.headers.get('access-control-allow-methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('access-control-allow-headers')).toBe('content-type, x-demo-passcode');
    expect(response.headers.get('access-control-max-age')).toBe('600');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('answers other origins without CORS headers', async () => {
    const response = await handler(
      new Request(ENDPOINT, { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('honours ALLOWED_ORIGIN on real requests too', async () => {
    const response = await handler(
      new Request(ENDPOINT, { method: 'POST', headers: { origin: 'https://preview.example.com' } }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://preview.example.com');
    expect(response.headers.get('access-control-expose-headers')).toBe('Retry-After');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects other methods with 405 and an Allow header', async () => {
    const response = await handler(new Request(ENDPOINT, { method: 'GET' }));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST, OPTIONS');
    expect(await response.json()).toEqual({ error: 'invalid_request', message: 'Use POST.' });
  });

  it('turns an unexpected exception into a JSON 500', async () => {
    const logger = testLogger();
    const failing = route({ methods: ['POST'], allowedOrigins: [], logger }, async () => {
      throw new Error('boom');
    });
    const response = await failing(new Request(ENDPOINT, { method: 'POST' }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'unknown', message: 'Something went wrong.' });
    expect(logger.error).toHaveBeenCalledOnce();
  });
});

describe('readJsonBody', () => {
  const read = (body: string, headers: Record<string, string>) =>
    readJsonBody(new Request(ENDPOINT, { method: 'POST', headers, body }));

  it('parses a JSON body', async () => {
    expect(await read('{"a":1}', { 'content-type': 'application/json; charset=utf-8' })).toEqual({
      ok: true,
      value: { a: 1 },
    });
  });

  it('requires the JSON content type', async () => {
    const result = await read('{"a":1}', { 'content-type': 'text/plain' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(415);
  });

  it('rejects malformed JSON and oversized bodies', async () => {
    const malformed = await read('{"a":', { 'content-type': 'application/json' });
    expect(!malformed.ok && malformed.response.status).toBe(400);
    const large = await read(JSON.stringify({ text: 'x'.repeat(20_000) }), {
      'content-type': 'application/json',
    });
    expect(!large.ok && large.response.status).toBe(413);
  });
});
