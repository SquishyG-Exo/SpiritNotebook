import { createAnthropicModel } from '../src/server/anthropic';
import { readConfig } from '../src/server/config';
import type { Handler } from '../src/server/http';
import { createInterpretHandler } from '../src/server/interpret';
import { createRateLimiter } from '../src/server/limiter';

let handler: Handler | undefined;

/**
 * Built on the first request, so env loaded by scripts/dev-api.ts is seen, and
 * then kept for the life of the instance so the in-memory rate limits persist.
 */
function getHandler(): Handler {
  if (!handler) {
    const config = readConfig(process.env);
    handler = createInterpretHandler({
      config,
      limiter: createRateLimiter(config.limits),
      model: config.apiKey
        ? createAnthropicModel({
            apiKey: config.apiKey,
            model: config.model,
            effort: config.effort,
            fallbacks: config.fallbacks,
          })
        : undefined,
    });
  }
  return handler;
}

/** POST /api/interpret — see the contract in src/api/client.ts. */
export default {
  fetch(request: Request): Promise<Response> {
    return getHandler()(request);
  },
};
