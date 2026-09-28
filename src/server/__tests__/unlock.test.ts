import { describe, expect, it } from 'vitest';

import { readConfig, type Env } from '../config';
import { createRateLimiter } from '../limiter';
import { createUnlockHandler } from '../unlock';
import { jsonRequest, testLogger } from './helpers';

const ENDPOINT = 'http://localhost:3000/api/unlock';

function setup(env: Env = {}) {
  const config = readConfig(env);
  const handler = createUnlockHandler({
    config,
    limiter: createRateLimiter(config.limits),
    logger: testLogger(),
  });
  const unlock = (body: unknown, headers: Record<string, string> = {}) =>
    handler(jsonRequest(ENDPOINT, body, headers));
  return { handler, unlock };
}

describe('GET /api/unlock', () => {
  it('says whether a passcode is required', async () => {
    const open = await setup().handler(new Request(ENDPOINT));
    expect(open.status).toBe(200);
    expect(open.headers.get('cache-control')).toBe('no-store');
    expect(await open.json()).toEqual({ required: false });

    const locked = await setup({ DEMO_PASSCODE: 'lotus-42' }).handler(new Request(ENDPOINT));
    expect(await locked.json()).toEqual({ required: true });
  });
});

describe('POST /api/unlock', () => {
  it('accepts the right code and refuses others', async () => {
    const { unlock } = setup({ DEMO_PASSCODE: 'lotus-42' });

    const right = await unlock({ code: 'lotus-42' });
    expect(right.status).toBe(200);
    expect(await right.json()).toEqual({ ok: true });

    for (const body of [{ code: 'lotus-41' }, { code: '' }, { code: 42 }, {}]) {
      const wrong = await unlock(body);
      expect(wrong.status).toBe(401);
      expect(await wrong.json()).toEqual({ error: 'unauthorized' });
    }
  });

  it('accepts anything when no passcode is configured', async () => {
    const { unlock } = setup();
    const response = await unlock({ code: 'whatever' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('allows 10 attempts per IP per minute', async () => {
    const { unlock } = setup({ DEMO_PASSCODE: 'lotus-42' });
    for (let i = 0; i < 10; i += 1) expect((await unlock({ code: `guess-${i}` })).status).toBe(401);

    const limited = await unlock({ code: 'lotus-42' });
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(await limited.json()).toMatchObject({ error: 'rate_limited', retryAfter: 60 });

    const otherIp = await unlock({ code: 'lotus-42' }, { 'x-forwarded-for': '198.51.100.9' });
    expect(otherIp.status).toBe(200);
  });

  it('refuses other methods and answers preflights', async () => {
    const { handler } = setup();
    const put = await handler(new Request(ENDPOINT, { method: 'PUT' }));
    expect(put.status).toBe(405);
    expect(put.headers.get('allow')).toBe('GET, POST, OPTIONS');

    const preflight = await handler(
      new Request(ENDPOINT, { method: 'OPTIONS', headers: { origin: 'http://localhost:8081' } }),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toBe('GET, POST, OPTIONS');
  });
});
