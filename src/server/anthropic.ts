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
  BetaMessageParam,
  BetaTextBlock,
  BetaTextBlockParam,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';

import type { Effort } from './config';
import type { Logger } from './http';
import { UpstreamError, type AdvisorInfo, type ModelCall, type ModelOutcome, type UpstreamFailure } from './model';
import { buildSystemPrompt, buildUserMessage } from './prompt';
import { ModelOutputSchema } from './schema';

/** Beta header for the `fallbacks: "default"` form (the array form uses a different one). */
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
/** Beta header for the advisor tool (lab 'advisor' readings). */
export const ADVISOR_BETA = 'advisor-tool-2026-03-01';
/** Caps the advisor's thinking plus text per call; the docs' recommended starting point. */
export const ADVISOR_MAX_TOKENS = 2048;
/** A turn can pause while an advisor call is pending; resend at most this many times. */
export const MAX_PAUSE_RESUMES = 2;
export const REQUEST_TIMEOUT_MS = 45_000;

export interface AnthropicModelOptions {
  apiKey: string;
  model: string;
  /** Consulted by the executor on 'advisor' readings. */
  advisorModel: string;
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
    const advisor = input.mode === 'advisor';
    const messages: BetaMessageParam[] = [{ role: 'user', content: buildUserMessage(input) }];
    const params: MessageCreateParamsNonStreaming = {
      model: options.model,
      max_tokens: maxTokens,
      system,
      messages,
      // Adaptive thinking: the only thinking mode on Sonnet 5 / Opus 5; stated so a model override keeps it on.
      thinking: { type: 'adaptive' },
      output_config: { effort: options.effort, format },
    };
    if (advisor) {
      params.tools = [
        {
          type: 'advisor_20260301',
          name: 'advisor',
          model: options.advisorModel,
          max_uses: 1,
          max_tokens: ADVISOR_MAX_TOKENS,
        },
      ];
    }
    const applyBetas = () => {
      const betas: NonNullable<MessageCreateParamsNonStreaming['betas']> = [];
      if (fallbacksEnabled) {
        betas.push(FALLBACK_BETA);
        params.fallbacks = 'default';
      } else {
        delete params.fallbacks;
      }
      if (advisor) betas.push(ADVISOR_BETA);
      if (betas.length > 0) params.betas = betas;
      else delete params.betas;
    };
    applyBetas();

    const send = async (): Promise<BetaMessage> => {
      try {
        return await client.beta.messages.create(params, { signal });
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
          applyBetas();
          try {
            return await client.beta.messages.create(params, { signal });
          } catch (retryError) {
            logger.error('[interpret] Claude API call failed', describeError(retryError));
            throw new UpstreamError(classifyError(retryError), 'Claude API call failed', {
              cause: retryError,
            });
          }
        }
        logger.error('[interpret] Claude API call failed', describeError(error));
        throw new UpstreamError(classifyError(error), 'Claude API call failed', { cause: error });
      }
    };

    let message = await send();
    // A turn can end with a pending advisor call; resending the transcript lets the API finish it.
    for (let resumes = 0; message.stop_reason === 'pause_turn' && resumes < MAX_PAUSE_RESUMES; resumes += 1) {
      messages.push({ role: 'assistant', content: message.content });
      message = await send();
    }
    logUsage(message, logger);
    return toOutcome(message, { advisor });
  };
}

function isBadRequest(error: unknown): boolean {
  return error instanceof APIError && error.status === 400;
}

/** Reads stop_reason before content: a refusal may carry empty or partial output. */
export function toOutcome(message: BetaMessage, options: { advisor?: boolean } = {}): ModelOutcome {
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

  // With the advisor tool the executor may write a short note before consulting it; the JSON is the last text block.
  const text = message.content.filter((block): block is BetaTextBlock => block.type === 'text').at(-1)?.text;
  if (!text) return { type: 'invalid', detail: 'no text block in the response' };
  let output: unknown;
  try {
    output = JSON.parse(text);
  } catch {
    return { type: 'invalid', detail: 'response text is not valid JSON' };
  }
  const outcome: Extract<ModelOutcome, { type: 'ok' }> = { type: 'ok', output, model: message.model };
  if (options.advisor) {
    const summary = summarizeAdvisor(message);
    outcome.advisor = summary.info;
    if (summary.advice) outcome.advice = summary.advice;
  }
  return outcome;
}

/** What the advisor did on this message: consulted or not, which model, its tokens, and plaintext advice when available. */
export function summarizeAdvisor(message: BetaMessage): { info: AdvisorInfo; advice?: string } {
  let consulted = false;
  let advice: string | undefined;
  let errorCode: string | undefined;
  for (const block of message.content) {
    if (block.type !== 'advisor_tool_result') continue;
    if (block.content.type === 'advisor_tool_result_error') {
      errorCode = block.content.error_code;
    } else {
      consulted = true;
      if (block.content.type === 'advisor_result') advice = block.content.text.trim();
    }
  }
  const iteration = (message.usage.iterations ?? []).find(
    (entry): entry is Extract<NonNullable<BetaMessage['usage']['iterations']>[number], { type: 'advisor_message' }> =>
      entry.type === 'advisor_message',
  );
  return {
    info: {
      requested: true,
      consulted,
      model: iteration?.model,
      inputTokens: iteration?.input_tokens,
      outputTokens: iteration?.output_tokens,
      ...(errorCode ? { errorCode } : {}),
    },
    advice,
  };
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
  const advisorIteration = (message.usage.iterations ?? []).find((entry) => entry.type === 'advisor_message');
  logger.info('[interpret] Claude API call', {
    model: message.model,
    stopReason: message.stop_reason,
    inputTokens: message.usage.input_tokens,
    cacheReadTokens: message.usage.cache_read_input_tokens,
    outputTokens: message.usage.output_tokens,
    ...(servedByFallback ? { servedByFallback } : {}),
    ...(advisorIteration && 'model' in advisorIteration
      ? {
          advisorModel: advisorIteration.model,
          advisorInputTokens: advisorIteration.input_tokens,
          advisorOutputTokens: advisorIteration.output_tokens,
        }
      : {}),
  });
}
