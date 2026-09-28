import type { BetaMessage } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { describe, expect, it, vi } from 'vitest';

import { createAnthropicModel, FALLBACK_BETA, toOutcome, type AnthropicModelOptions } from '../anthropic';
import { UpstreamError, type ModelRequest } from '../model';
import { sampleReading, testLogger } from './helpers';

/**
 * These tests run the real SDK against a fake `fetch`, so they pin down the
 * exact HTTP request the SDK builds and how responses and errors are mapped.
 */

interface SentRequest {
  url: string;
  headers: Headers;
  body: Record<string, unknown> & {
    system: { type: string; text: string; cache_control?: unknown }[];
    messages: { role: string; content: string }[];
    output_config: { effort: string; format: Record<string, unknown> };
  };
}

type Reply = Response | ((init: RequestInit) => Promise<Response>);

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'request-id': 'req_test', ...headers },
  });
}

function message(overrides: Partial<BetaMessage> = {}): BetaMessage {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5',
    content: [
      { type: 'thinking', thinking: '', signature: 'sig' },
      { type: 'text', text: JSON.stringify(sampleReading), citations: null },
    ],
    stop_reason: 'end_turn',
    stop_sequence: null,
    stop_details: null,
    container: null,
    context_management: null,
    diagnostics: null,
    usage: {
      input_tokens: 40,
      output_tokens: 310,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 1100,
      iterations: null,
    },
    ...overrides,
  } as BetaMessage;
}

function apiError(status: number, type: string, headers: Record<string, string> = {}): Response {
  return jsonResponse(
    status,
    { type: 'error', error: { type, message: `upstream says ${type}` }, request_id: 'req_test' },
    headers,
  );
}

function setup(replies: Reply[], options: Partial<AnthropicModelOptions> = {}) {
  const sent: SentRequest[] = [];
  const queue = [...replies];
  const fetch = vi.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    sent.push({
      url: String(url),
      headers: new Headers(init.headers),
      body: JSON.parse(String(init.body)) as SentRequest['body'],
    });
    const reply = queue.shift();
    if (!reply) throw new Error('unexpected extra request');
    return typeof reply === 'function' ? reply(init) : reply;
  });
  const logger = testLogger();
  const model = createAnthropicModel({
    apiKey: 'sk-ant-test-key',
    model: 'claude-opus-5',
    effort: 'low',
    fallbacks: 'default',
    logger,
    ...options,
    clientOptions: { fetch, baseURL: 'https://api.anthropic.com', ...options.clientOptions },
  });
  return { model, sent, fetch, logger };
}

const request: ModelRequest = {
  input: { text: 'A heron stood still at the lake.', category: 'animals', language: 'en' },
  maxTokens: 1024,
};

async function failureOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.then(
    () => null,
    (reason: unknown) => reason,
  );
  if (!(error instanceof UpstreamError)) throw new Error(`expected an UpstreamError, got ${String(error)}`);
  return error.failure;
}

describe('createAnthropicModel request', () => {
  it('sends the documented Messages API request', async () => {
    const { model, sent } = setup([jsonResponse(200, message())]);
    expect(await model(request)).toEqual({ type: 'ok', output: sampleReading, model: 'claude-opus-5' });

    const [call] = sent;
    expect(call.url).toBe('https://api.anthropic.com/v1/messages?beta=true');
    expect(call.headers.get('x-api-key')).toBe('sk-ant-test-key');
    expect(call.headers.get('authorization')).toBeNull();
    expect(call.headers.get('anthropic-beta')).toBe(FALLBACK_BETA);
    expect(call.body).toMatchObject({
      model: 'claude-opus-5',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      fallbacks: 'default',
      output_config: {
        effort: 'low',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['kind', 'title', 'interpretation', 'reflection_question'],
          },
        },
      },
    });
    expect(Object.keys(call.body).sort()).toEqual(
      ['fallbacks', 'max_tokens', 'messages', 'model', 'output_config', 'system', 'thinking'].sort(),
    );

    expect(call.body.system).toHaveLength(1);
    expect(call.body.system[0]).toMatchObject({ type: 'text', cache_control: { type: 'ephemeral' } });
    expect(call.body.system[0].text).toContain('## Runtime rules');
    expect(call.body.messages).toEqual([
      { role: 'user', content: expect.stringContaining('<entry>\nA heron stood still at the lake.\n</entry>') },
    ]);
  });

  it('keeps the system prompt byte-identical across calls so it can be cached', async () => {
    const { model, sent } = setup([jsonResponse(200, message()), jsonResponse(200, message())]);
    await model(request);
    await model({ ...request, input: { ...request.input, language: 'es', text: 'Una garza quieta.' } });
    expect(sent[1].body.system).toEqual(sent[0].body.system);
    expect(sent[1].body.messages[0].content).toContain('Escribe en español');
  });

  it('omits the fallback beta when ANTHROPIC_FALLBACKS=off', async () => {
    const { model, sent } = setup([jsonResponse(200, message())], { fallbacks: 'off', effort: 'medium' });
    await model(request);
    expect(sent[0].headers.get('anthropic-beta')).toBeNull();
    expect(sent[0].body).not.toHaveProperty('fallbacks');
    expect(sent[0].body.output_config.effort).toBe('medium');
  });

  it('retries once without the fallback beta when the API rejects it with a 400', async () => {
    const { model, sent, logger } = setup([
      apiError(400, 'invalid_request_error'),
      jsonResponse(200, message()),
      jsonResponse(200, message()),
    ]);
    expect(await model(request)).toMatchObject({ type: 'ok' });
    expect(sent[0].body).toHaveProperty('fallbacks', 'default');
    expect(sent[1].headers.get('anthropic-beta')).toBeNull();
    expect(sent[1].body).not.toHaveProperty('fallbacks');
    expect(logger.warn).toHaveBeenCalledWith(
      '[interpret] request rejected with server-side fallback on; retrying without it',
      expect.objectContaining({ status: 400 }),
    );
    // The beta stays off for later calls on this instance.
    await model(request);
    expect(sent[2].body).not.toHaveProperty('fallbacks');
  });

  it('does not retry a 400 when the fallback beta was already off', async () => {
    const { model, sent } = setup([apiError(400, 'invalid_request_error')], { fallbacks: 'off' });
    expect(await failureOf(model(request))).toBe('other');
    expect(sent).toHaveLength(1);
  });

  it('logs usage and notices a reading served by the fallback model', async () => {
    const fallbackMessage = message({
      model: 'claude-opus-4-8',
      content: [
        { type: 'fallback', from: { model: 'claude-opus-5' }, to: { model: 'claude-opus-4-8' } },
        { type: 'text', text: JSON.stringify(sampleReading), citations: null },
      ] as BetaMessage['content'],
      usage: {
        ...message().usage,
        iterations: [
          { type: 'message', input_tokens: 40, output_tokens: 0 },
          { type: 'fallback_message', input_tokens: 40, output_tokens: 300 },
        ],
      } as unknown as BetaMessage['usage'],
    });
    const { model, logger } = setup([jsonResponse(200, fallbackMessage)]);
    expect(await model(request)).toMatchObject({ type: 'ok', model: 'claude-opus-4-8' });
    expect(logger.info).toHaveBeenCalledWith(
      '[interpret] Claude API call',
      expect.objectContaining({ model: 'claude-opus-4-8', servedByFallback: true }),
    );
  });
});

describe('toOutcome', () => {
  it('checks stop_reason before reading content', () => {
    expect(toOutcome(message({ stop_reason: 'refusal', content: [], stop_details: { category: 'cyber', explanation: null } as BetaMessage['stop_details'] })))
      .toEqual({ type: 'refusal', category: 'cyber' });
    // A mid-output refusal leaves partial JSON behind; it is still a refusal, not bad JSON.
    expect(toOutcome(message({ stop_reason: 'refusal', content: [{ type: 'text', text: '{"kind":"rea', citations: null }] })))
      .toEqual({ type: 'refusal', category: null });
    expect(toOutcome(message({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{"kind":"reading","ti', citations: null }] })))
      .toEqual({ type: 'truncated' });
  });

  it('flags missing or unparseable text', () => {
    expect(toOutcome(message({ content: [{ type: 'text', text: 'Here is your reading!', citations: null }] })))
      .toMatchObject({ type: 'invalid' });
    expect(toOutcome(message({ content: [{ type: 'thinking', thinking: '', signature: 'sig' }] })))
      .toMatchObject({ type: 'invalid' });
    expect(toOutcome(message({ stop_reason: 'pause_turn' }))).toMatchObject({ type: 'invalid' });
  });
});

describe('createAnthropicModel errors', () => {
  it.each([
    [429, 'rate_limit_error', 'busy'],
    [529, 'overloaded_error', 'busy'],
    [500, 'api_error', 'other'],
    [401, 'authentication_error', 'other'],
    [400, 'invalid_request_error', 'other'],
  ])('maps HTTP %i (%s) to %s', async (status, type, failure) => {
    // fallbacks off: a 400 with the fallback beta on is retried without it (covered above).
    const { model, logger } = setup([apiError(status, type)], {
      clientOptions: { maxRetries: 0 },
      fallbacks: 'off',
    });
    expect(await failureOf(model(request))).toBe(failure);
    expect(logger.error).toHaveBeenCalledWith(
      '[interpret] Claude API call failed',
      expect.objectContaining({ status, type }),
    );
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('sk-ant-test-key');
  });

  it('retries once (maxRetries: 1) before giving up', async () => {
    const overloaded = () => apiError(529, 'overloaded_error', { 'retry-after-ms': '1' });
    const recovered = setup([overloaded(), jsonResponse(200, message())]);
    expect(await recovered.model(request)).toMatchObject({ type: 'ok' });
    expect(recovered.fetch).toHaveBeenCalledTimes(2);

    const exhausted = setup([overloaded(), overloaded(), jsonResponse(200, message())]);
    expect(await failureOf(exhausted.model(request))).toBe('busy');
    expect(exhausted.fetch).toHaveBeenCalledTimes(2);
  });

  it('maps connection failures and timeouts', async () => {
    const refused = setup([() => Promise.reject(new TypeError('fetch failed'))], {
      clientOptions: { maxRetries: 0 },
    });
    expect(await failureOf(refused.model(request))).toBe('connection');

    const hang = (init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    const slow = setup([hang], { clientOptions: { maxRetries: 0, timeout: 20 } });
    expect(await failureOf(slow.model(request))).toBe('timeout');
  });

  it('treats the route running out of time as a timeout', async () => {
    const { model, fetch } = setup([jsonResponse(200, message())]);
    const signal = AbortSignal.abort();
    expect(await failureOf(model({ ...request, signal }))).toBe('timeout');
    expect(fetch).not.toHaveBeenCalled();
  });
});
