import type { InterpretInput } from './schema';

/**
 * The seam between the route and whatever produces a reading (Claude, the mock,
 * or a test fake). Nothing here depends on the Anthropic SDK.
 */
export interface ModelRequest {
  input: InterpretInput;
  maxTokens: number;
  /** Aborted when the route's overall time budget runs out. */
  signal?: AbortSignal;
}

export type ModelOutcome =
  /** `output` is the parsed JSON object, not yet validated against ReadingSchema. */
  | { type: 'ok'; output: unknown; model: string }
  | { type: 'refusal'; category: string | null }
  /** Stopped at max_tokens: the JSON is incomplete. */
  | { type: 'truncated' }
  | { type: 'invalid'; detail: string };

export type ModelCall = (request: ModelRequest) => Promise<ModelOutcome>;

export type UpstreamFailure =
  | 'refusal'
  | 'busy'
  | 'timeout'
  | 'connection'
  | 'invalid_output'
  | 'other';

/** A failure to get a usable reading. The message is for logs only, never for the client. */
export class UpstreamError extends Error {
  readonly failure: UpstreamFailure;

  constructor(failure: UpstreamFailure, message?: string, options?: { cause?: unknown }) {
    super(message ?? failure, options);
    this.name = 'UpstreamError';
    this.failure = failure;
  }
}
