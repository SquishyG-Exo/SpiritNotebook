import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  RateLimitError,
  type ClientOptions,
} from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type {
  BetaMessage,
  BetaTextBlock,
  BetaTextBlockParam,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';

import type { Effort } from './config';
import type { Logger } from './http';
import { UpstreamError, type ModelCall, type ModelOutcome, type UpstreamFailure } from './model';
import { buildSystemPrompt, buildUserMessage } from './prompt';
import { ModelOutputSchema } from './schema';

/** Beta header for the `fallbacks: "default"` form (the array form uses a different one). */
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
export const REQUEST_TIMEOUT_MS = 45_000;

export interface AnthropicModelOptions {
  apiKey: string;
  model: string;
  effort: Effort;
  fallbacks: 'default' | 'off';
  logger?: Logger;
  /** Overrides for the SDK client, e.g. a fake `fetch` in tests. */
  clientOptions?: ClientOptions;
}

export function createAnthropicModel(options: AnthropicModelOptions): ModelCall {
  const logger = options.logger ?? console;
  const client = new Anthropic({
    apiKey: options.apiKey,
    // Otherwise an ANTHROPIC_AUTH_TOKEN in the environment is sent as well, and the API rejects both together.
    authToken: null,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 1,
    ...options.clientOptions,
  });
  // The SDK helper turns the zod schema into the JSON schema structured outputs accept.
  const format = betaZodOutputFormat(ModelOutputSchema);
  let system: BetaTextBlockParam[] | undefined;
  let fallbacksEnabled = options.fallbacks === 'default';

  return async ({ input, maxTokens, signal }) => {
    system ??= [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }];
    const params: MessageCreateParamsNonStreaming = {
      model: options.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: buildUserMessage(input) }],
      // Adaptive thinking: the only thinking mode on Sonnet 5 / Opus 5; stated so a model override keeps it on.
      thinking: { type: 'adaptive' },
      output_config: { effort: options.effort, format },
    };
    if (fallbacksEnabled) {
      params.betas = [FALLBACK_BETA];
      params.fallbacks = 'default';
    }

    let message: BetaMessage;
    try {
      message = await client.beta.messages.create(params, { signal });
    } catch (error) {
      // The server-side fallback is a beta: an account or model without access
      // rejects the whole request with a 400. Drop the beta for the rest of
      // this instance's life and try once more, rather than failing readings.
      if (fallbacksEnabled && isBadRequest(error)) {
        logger.warn(
          '[interpret] request rejected with server-side fallback on; retrying without it',
          describeError(error),
        );
        fallbacksEnabled = false;
        delete params.betas;
        delete params.fallbacks;
        try {
          message = await client.beta.messages.create(params, { signal });
        } catch (retryError) {
          logger.error('[interpret] Claude API call failed', describeError(retryError));
          throw new UpstreamError(classifyError(retryError), 'Claude API call failed', {
            cause: retryError,
          });
        }
      } else {
        logger.error('[interpret] Claude API call failed', describeError(error));
        throw new UpstreamError(classifyError(error), 'Claude API call failed', { cause: error });
      }
    }
    logUsage(message, logger);
    return toOutcome(message);
  };
}

function isBadRequest(error: unknown): boolean {
  return error instanceof APIError && error.status === 400;
}

/** Reads stop_reason before content: a refusal may carry empty or partial output. */
export function toOutcome(message: BetaMessage): ModelOutcome {
  switch (message.stop_reason) {
    case 'refusal':
      return { type: 'refusal', category: message.stop_details?.category ?? null };
    case 'max_tokens':
      return { type: 'truncated' };
    case 'end_turn':
      break;
    default:
      return { type: 'invalid', detail: `unexpected stop_reason: ${String(message.stop_reason)}` };
  }

  const text = message.content.find((block): block is BetaTextBlock => block.type === 'text')?.text;
  if (!text) return { type: 'invalid', detail: 'no text block in the response' };
  try {
    return { type: 'ok', output: JSON.parse(text) as unknown, model: message.model };
  } catch {
    return { type: 'invalid', detail: 'response text is not valid JSON' };
  }
}

export function classifyError(error: unknown): UpstreamFailure {
  // Our own signal: the route's overall time budget ran out.
  if (error instanceof APIUserAbortError) return 'timeout';
  if (error instanceof APIConnectionTimeoutError) return 'timeout';
  if (error instanceof APIConnectionError) return 'connection';
  if (error instanceof RateLimitError) return 'busy';
  if (error instanceof APIError && (error.status === 529 || error.type === 'overloaded_error')) {
    return 'busy';
  }
  return 'other';
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof APIError) {
    return {
      name: error.name,
      status: error.status,
      type: error.type,
      requestId: error.requestID,
      message: error.message,
    };
  }
  return { error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
}

function logUsage(message: BetaMessage, logger: Logger): void {
  const servedByFallback = (message.usage.iterations ?? []).some(
    (entry) => entry.type === 'fallback_message',
  );
  logger.info('[interpret] Claude API call', {
    model: message.model,
    stopReason: message.stop_reason,
    inputTokens: message.usage.input_tokens,
    cacheReadTokens: message.usage.cache_read_input_tokens,
    outputTokens: message.usage.output_tokens,
    ...(servedByFallback ? { servedByFallback } : {}),
  });
}
