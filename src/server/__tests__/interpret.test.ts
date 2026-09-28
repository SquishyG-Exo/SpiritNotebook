import { describe, expect, it, vi } from 'vitest';

import { readConfig, type Env } from '../config';
import { createInterpretHandler } from '../interpret';
import { createRateLimiter } from '../limiter';
import { MOCK_DELAY_MS, MOCK_SLOW_DELAY_MS } from '../mock';
import { UpstreamError, type ModelCall, type ModelOutcome } from '../model';
import { IP, jsonRequest, sampleReading, testLogger, validBody } from './helpers';

const ENDPOINT = 'http://localhost:3000/api/interpret';

const ok = (output: unknown = sampleReading, model = 'claude-opus-5'): ModelOutcome => ({
  type: 'ok',
  output,
  model,
});

function setup(env: Env = {}, outcomes: (ModelOutcome | Error)[] = [ok()]) {
  const config = readConfig({ ANTHROPIC_API_KEY: 'sk-ant-test', ...env });
  const queue = [...outcomes];
  const model = vi.fn<ModelCall>(async () => {
    const next = queue.length > 1 ? queue.shift() : queue[0];
    if (!next) throw new Error('no outcome queued');
    if (next instanceof Error) throw next;
    return next;
  });
  const sleep = vi.fn(async (_ms: number) => {});
  const logger = testLogger();
  const handler = createInterpretHandler({
    config,
    limiter: createRateLimiter(config.limits),
    model,
    sleep,
    logger,
  });
  const post = (body: unknown = validBody, headers: Record<string, string> = {}) =>
    handler(jsonRequest(ENDPOINT, body, headers));
  return { handler, model, sleep, logger, post };
}

describe('POST /api/interpret', () => {
  it('returns the reading with its language and model', async () => {
    const { post, model } = setup();
    const response = await post();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      ...sampleReading,
      language: 'en',
      advisor: { requested: false, consulted: false },
      duration_ms: expect.any(Number),
    });
    expect(model).toHaveBeenCalledOnce();
    expect(model).toHaveBeenCalledWith({
      input: {
        text: validBody.text.trim(),
        category: 'animals',
        language: 'en',
        subcategory: undefined,
        mode: 'standard',
      },
      maxTokens: 1024,
      signal: expect.any(AbortSignal),
    });
  });

  it('passes a care response through', async () => {
    const care = { ...sampleReading, kind: 'care', title: 'You Deserve Support' };
    const { post } = setup({}, [ok(care)]);
    const body = await (await post()).json();
    expect(body).toMatchObject({ kind: 'care', title: 'You Deserve Support' });
  });

  it('never exposes model ids to the client', async () => {
    const { post } = setup({}, [ok(sampleReading, 'claude-opus-4-8')]);
    const body = await (await post()).json();
    expect(body).not.toHaveProperty('model');
    expect(JSON.stringify(body)).not.toContain('claude-');
  });

  it('rejects invalid bodies with 400 before calling the model', async () => {
    const { post, model } = setup();
    for (const body of [
      { ...validBody, text: 'short' },
      { ...validBody, text: 'x'.repeat(1501) },
      { ...validBody, category: 'tarot' },
      { ...validBody, language: 'fr' },
      { ...validBody, subcategory: 'lottery' },
    ]) {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'invalid_request', message: expect.any(String) });
    }
    expect(model).not.toHaveBeenCalled();
  });

  it('requires a JSON content type', async () => {
    const { handler } = setup();
    const response = await handler(
      new Request(ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }),
    );
    expect(response.status).toBe(415);
    expect(await response.json()).toMatchObject({ error: 'invalid_request' });
  });

  it('requires the passcode when DEMO_PASSCODE is set', async () => {
    const { post, model } = setup({ DEMO_PASSCODE: 'lotus-42' });

    const missing = await post();
    expect(missing.status).toBe(401);
    expect(await missing.json()).toEqual({ error: 'unauthorized' });
    expect((await post(validBody, { 'x-demo-passcode': 'lotus-41' })).status).toBe(401);
    expect(model).not.toHaveBeenCalled();

    expect((await post(validBody, { 'x-demo-passcode': 'lotus-42' })).status).toBe(200);
  });

  it('answers 503 not_configured without an API key or MOCK_AI', async () => {
    const config = readConfig({ MOCK_AI: '1' });
    const handler = createInterpretHandler({
      config,
      limiter: createRateLimiter(config.limits),
      logger: testLogger(),
    });
    const response = await handler(jsonRequest(ENDPOINT, validBody));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'not_configured' });
  });

  it.each([
    ['busy', 503, 'The guide is busy right now.'],
    ['timeout', 504, 'The guide took too long to respond.'],
    ['connection', 502, 'The guide could not be reached.'],
    ['other', 502, 'The guide could not respond right now.'],
  ] as const)('maps an upstream %s failure to %i', async (failure, status, message) => {
    const { post, model } = setup({}, [new UpstreamError(failure, 'raw upstream detail')]);
    const response = await post();
    expect(response.status).toBe(status);
    const body = await response.json();
    expect(body).toEqual({ error: 'upstream_error', message });
    expect(JSON.stringify(body)).not.toContain('raw upstream detail');
    expect(model).toHaveBeenCalledOnce();
  });

  it('does not retry a refusal', async () => {
    const { post, model } = setup({}, [{ type: 'refusal', category: 'cyber' }]);
    const response = await post();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'upstream_error',
      message: 'The guide could not respond to this entry.',
    });
    expect(model).toHaveBeenCalledOnce();
  });

  it('retries once when the output fails validation', async () => {
    const { post, model } = setup({}, [ok({ ...sampleReading, title: '' }), ok()]);
    const response = await post();
    expect(response.status).toBe(200);
    expect(model).toHaveBeenCalledTimes(2);
  });

  it('gives up with 502 after two unusable answers', async () => {
    const { post, model } = setup({}, [
      { type: 'invalid', detail: 'response text is not valid JSON' },
      ok({ ...sampleReading, interpretation: 'Too short.' }),
    ]);
    const response = await post();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'upstream_error',
      message: 'The guide could not finish this reading.',
    });
    expect(model).toHaveBeenCalledTimes(2);
  });

  it('retries a max_tokens stop once with a larger budget', async () => {
    const { post, model } = setup({}, [{ type: 'truncated' }, ok()]);
    expect((await post()).status).toBe(200);
    expect(model.mock.calls.map(([request]) => request.maxTokens)).toEqual([1024, 2048]);
  });
});

describe('rate limits on /api/interpret', () => {
  it('answers 429 with Retry-After after 8 requests a minute from one IP', async () => {
    const { post, model } = setup();
    for (let i = 0; i < 8; i += 1) expect((await post()).status).toBe(200);

    const limited = await post();
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(await limited.json()).toEqual({
      error: 'rate_limited',
      message: expect.any(String),
      retryAfter: 60,
    });
    expect(model).toHaveBeenCalledTimes(8);
  });

  it('counts only delivered readings toward the daily cap', async () => {
    const { post } = setup({ RATE_LIMIT_PER_IP_PER_MINUTE: '100', RATE_LIMIT_PER_IP_PER_DAY: '2' }, [
      new UpstreamError('busy'),
      new UpstreamError('busy'),
      ok(),
    ]);
    // Validation failures and upstream failures do not use up the day's readings.
    expect((await post({ ...validBody, text: 'short' })).status).toBe(400);
    expect((await post()).status).toBe(503);
    expect((await post()).status).toBe(503);
    expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(200);

    const limited = await post();
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('86400');
    expect(await limited.json()).toMatchObject({ error: 'rate_limited', retryAfter: 86_400 });
  });

  it('applies the global daily cap across IPs before calling the model', async () => {
    const { post, model } = setup({ RATE_LIMIT_GLOBAL_PER_DAY: '2' });
    expect((await post(validBody, { 'x-forwarded-for': '198.51.100.1' })).status).toBe(200);
    expect((await post(validBody, { 'x-forwarded-for': '198.51.100.2' })).status).toBe(200);

    const limited = await post(validBody, { 'x-forwarded-for': '198.51.100.3' });
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({
      error: 'rate_limited',
      message: 'The notebook has reached its reading limit for today. Please try again later.',
    });
    expect(model).toHaveBeenCalledTimes(2);
  });
});

describe('MOCK_AI=true', () => {
  function mockSetup(env: Env = {}) {
    const config = readConfig({ MOCK_AI: 'true', ...env });
    const sleep = vi.fn(async (_ms: number) => {});
    const model = vi.fn<ModelCall>();
    const handler = createInterpretHandler({
      config,
      limiter: createRateLimiter(config.limits),
      model,
      sleep,
      logger: testLogger(),
    });
    const post = (body: unknown) => handler(jsonRequest(ENDPOINT, body));
    return { post, sleep, model };
  }

  it('returns a canned reading in the requested language without an API key', async () => {
    const { post, sleep, model } = mockSetup();
    const response = await post({ ...validBody, language: 'es' });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      kind: 'reading',
      title: 'Una invitación silenciosa',
      language: 'es',
    });
    expect(sleep).toHaveBeenCalledWith(MOCK_DELAY_MS);
    expect(model).not.toHaveBeenCalled();
  });

  it('supports the mock:care, mock:error and mock:slow triggers', async () => {
    const { post, sleep } = mockSetup();

    const care = await post({ ...validBody, text: 'Testing the crisis path mock:care' });
    expect(await care.json()).toMatchObject({ kind: 'care' });

    const error = await post({ ...validBody, text: 'Testing a failure mock:error' });
    expect(error.status).toBe(502);
    expect(await error.json()).toMatchObject({ error: 'upstream_error' });

    const slow = await post({ ...validBody, text: 'Testing a slow reading mock:slow' });
    expect(slow.status).toBe(200);
    expect(sleep).toHaveBeenLastCalledWith(MOCK_SLOW_DELAY_MS);
  });
});

describe('CORS on /api/interpret', () => {
  it('answers the Expo web dev server preflight and tags the response', async () => {
    const { handler } = setup();
    const preflight = await handler(
      new Request(ENDPOINT, { method: 'OPTIONS', headers: { origin: 'http://localhost:8081' } }),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-origin')).toBe('http://localhost:8081');
    expect(preflight.headers.get('access-control-allow-headers')).toContain('x-demo-passcode');

    const response = await handler(
      jsonRequest(ENDPOINT, validBody, { origin: 'http://localhost:8081' }),
    );
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:8081');
  });

  it('refuses methods other than POST', async () => {
    const { handler } = setup();
    const response = await handler(new Request(ENDPOINT, { headers: { 'x-forwarded-for': IP } }));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST, OPTIONS');
  });
});

describe('advisor mode', () => {
  it('passes the mode to the model and reports the advisor summary', async () => {
    const advised: ModelOutcome = {
      type: 'ok',
      output: sampleReading,
      model: 'claude-sonnet-5',
      advisor: { requested: true, consulted: true, model: 'claude-opus-5', inputTokens: 900, outputTokens: 300 },
      advice: 'Lead with the stillness.',
    };
    const { post, model } = setup({}, [advised]);
    const response = await post({ ...validBody, mode: 'advisor' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      advisor: { requested: true, consulted: true },
      advice: 'Lead with the stillness.',
      duration_ms: expect.any(Number),
    });
    expect(body).not.toHaveProperty('model');
    expect(body.advisor).not.toHaveProperty('model');
    expect(model).toHaveBeenCalledWith(
      expect.objectContaining({ input: expect.objectContaining({ mode: 'advisor' }) }),
    );
  });
});
