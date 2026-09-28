import { readConfig } from '../src/server/config';
import type { Handler } from '../src/server/http';
import { createRateLimiter } from '../src/server/limiter';
import { createUnlockHandler } from '../src/server/unlock';

let handler: Handler | undefined;

/** Built on the first request and kept, like api/interpret.ts. */
function getHandler(): Handler {
  if (!handler) {
    const config = readConfig(process.env);
    handler = createUnlockHandler({ config, limiter: createRateLimiter(config.limits) });
  }
  return handler;
}

/** GET /api/unlock and POST /api/unlock { code } — see src/api/client.ts. */
export default {
  fetch(request: Request): Promise<Response> {
    return getHandler()(request);
  },
};
