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
import { SCOPES, type RateLimiter } from './limiter';
import { passcodeMatches } from './passcode';

export interface UnlockDeps {
  config: ServerConfig;
  limiter: RateLimiter;
  logger?: Logger;
}

/**
 * GET  → { required }: whether the app should show the passcode screen.
 * POST { code } → { ok: true } | 401. Attempts are rate limited per IP.
 */
export function createUnlockHandler(deps: UnlockDeps): Handler {
  const { config, limiter } = deps;

  return route(
    { methods: ['GET', 'POST'], allowedOrigins: config.allowedOrigins, logger: deps.logger },
    async (request) => {
      if (request.method === 'GET') return json(200, { required: Boolean(config.passcode) });

      const attempt = await limiter.check(SCOPES.unlockPerIpMinute, clientIp(request));
      if (!attempt.ok) {
        return rateLimited(attempt.retryAfter, 'Too many attempts. Please wait a minute and try again.');
      }
      if (!config.passcode) return json(200, { ok: true });

      const body = await readJsonBody(request);
      if (!body.ok) return body.response;
      const code =
        typeof body.value === 'object' && body.value !== null && 'code' in body.value
          ? body.value.code
          : undefined;
      return passcodeMatches(config.passcode, code)
        ? json(200, { ok: true })
        : errorJson(401, 'unauthorized');
    },
  );
}
