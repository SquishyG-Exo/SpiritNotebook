import type { ServerConfig } from './config';
import {
  clientIp,
  errorJson,
  json,
  rateLimited,
  readJsonBody,
  route,
  type Handler,
  type Logger,
} from './http';
import { GLOBAL_KEY, SCOPES, type RateLimiter } from './limiter';
import { createMockModel, sleep, type Sleep } from './mock';
import { UpstreamError, type AdvisorInfo, type ModelCall, type UpstreamFailure } from './model';
import { hasValidPasscode } from './passcode';
import {
  describeIssue,
  InterpretRequestSchema,
  ReadingSchema,
  type InterpretInput,
  type Reading,
} from './schema';

/** Budget for all model attempts of one request; vercel.json allows the function 60 s. */
export const MODEL_BUDGET_MS = 55_000;
export const MAX_ATTEMPTS = 2;

export interface InterpretDeps {
  config: ServerConfig;
  limiter: RateLimiter;
  /** Calls Claude. Absent when no API key is configured; MOCK_AI replaces it. */
  model?: ModelCall;
  /** The mock's delay; tests pass an instant one. */
  sleep?: Sleep;
  logger?: Logger;
}

/** Client-facing messages. Upstream details stay in the server logs. */
const UPSTREAM_RESPONSES: Record<UpstreamFailure, { status: number; message: string }> = {
  refusal: { status: 502, message: 'The guide could not respond to this entry.' },
  busy: { status: 503, message: 'The guide is busy right now.' },
  timeout: { status: 504, message: 'The guide took too long to respond.' },
  connection: { status: 502, message: 'The guide could not be reached.' },
  invalid_output: { status: 502, message: 'The guide could not finish this reading.' },
  other: { status: 502, message: 'The guide could not respond right now.' },
};

export interface GeneratedReading {
  reading: Reading;
  model: string;
  advisor?: AdvisorInfo;
  advice?: string;
}

interface GenerateOptions {
  maxTokens: number;
  signal?: AbortSignal;
  logger: Logger;
}

/**
 * Calls the model and validates what comes back. An invalid or truncated
 * answer is retried once (a truncated one with twice the token budget, since
 * max_tokens covers thinking as well as the answer); a refusal is not retried.
 */
export async function generateReading(
  model: ModelCall,
  input: InterpretInput,
  { maxTokens, signal, logger }: GenerateOptions,
): Promise<GeneratedReading> {
  let budget = maxTokens;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (signal?.aborted) throw new UpstreamError('timeout', 'time budget spent before a retry');
    const outcome = await model({ input, maxTokens: budget, signal });

    if (outcome.type === 'refusal') {
      throw new UpstreamError('refusal', `refused (category: ${outcome.category ?? 'none'})`);
    }
    if (outcome.type === 'ok') {
      const parsed = ReadingSchema.safeParse(outcome.output);
      if (parsed.success) {
        return { reading: parsed.data, model: outcome.model, advisor: outcome.advisor, advice: outcome.advice };
      }
      logger.warn('[interpret] reading failed validation', {
        attempt,
        issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    } else if (outcome.type === 'truncated') {
      budget = maxTokens * 2;
      logger.warn('[interpret] reading hit max_tokens', { attempt });
    } else {
      logger.warn('[interpret] unusable model output', { attempt, detail: outcome.detail });
    }
  }
  throw new UpstreamError('invalid_output', `no valid reading after ${MAX_ATTEMPTS} attempts`);
}

/** Reserves one reading against the daily caps, or answers 429. */
async function reserveDaily(limiter: RateLimiter, ip: string): Promise<Response | null> {
  const perIp = await limiter.check(SCOPES.interpretPerIpDay, ip);
  if (!perIp.ok) {
    return rateLimited(
      perIp.retryAfter,
      "You've reached today's limit of readings. Please come back tomorrow.",
    );
  }
  const global = await limiter.check(SCOPES.interpretGlobalDay, GLOBAL_KEY);
  if (!global.ok) {
    await limiter.release(SCOPES.interpretPerIpDay, ip);
    return rateLimited(
      global.retryAfter,
      'The notebook has reached its reading limit for today. Please try again later.',
    );
  }
  return null;
}

async function releaseDaily(limiter: RateLimiter, ip: string): Promise<void> {
  await limiter.release(SCOPES.interpretPerIpDay, ip);
  await limiter.release(SCOPES.interpretGlobalDay, GLOBAL_KEY);
}

export function createInterpretHandler(deps: InterpretDeps): Handler {
  const { config, limiter } = deps;
  const logger = deps.logger ?? console;
  const model = config.mockAi ? createMockModel(deps.sleep ?? sleep) : deps.model;

  return route(
    { methods: ['POST'], allowedOrigins: config.allowedOrigins, logger },
    async (request) => {
      const ip = clientIp(request);

      // Counts every attempt, wrong passcodes included, so it also slows passcode guessing.
      const burst = await limiter.check(SCOPES.interpretPerIpMinute, ip);
      if (!burst.ok) {
        return rateLimited(burst.retryAfter, 'Too many requests. Please wait a moment and try again.');
      }

      if (!hasValidPasscode(request, config.passcode)) return errorJson(401, 'unauthorized');

      const body = await readJsonBody(request);
      if (!body.ok) return body.response;
      const parsed = InterpretRequestSchema.safeParse(body.value);
      if (!parsed.success) return errorJson(400, 'invalid_request', describeIssue(parsed.error));
      const input = parsed.data;

      if (!model) {
        return errorJson(503, 'not_configured', 'The guide is not configured on this server.');
      }

      // Reserved before the call and given back if it fails, so only delivered readings count.
      const limited = await reserveDaily(limiter, ip);
      if (limited) return limited;

      const started = Date.now();
      try {
        const { reading, model: servedBy, advisor, advice } = await generateReading(model, input, {
          maxTokens: config.maxOutputTokens,
          signal: AbortSignal.timeout(MODEL_BUDGET_MS),
          logger,
        });
        return json(200, {
          ...reading,
          language: input.language,
          model: servedBy,
          advisor: {
            requested: input.mode === 'advisor',
            consulted: advisor?.consulted ?? false,
            ...(advisor?.model ? { model: advisor.model } : {}),
          },
          ...(advice ? { advice } : {}),
          duration_ms: Date.now() - started,
        });
      } catch (error) {
        await releaseDaily(limiter, ip);
        if (!(error instanceof UpstreamError)) throw error;
        logger.warn('[interpret] no reading', { failure: error.failure, detail: error.message });
        const { status, message } = UPSTREAM_RESPONSES[error.failure];
        return errorJson(status, 'upstream_error', message);
      }
    },
  );
}
