/** Error codes the client understands; see src/api/client.ts. */
export type ApiErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'
  | 'unknown';

export type Handler = (request: Request) => Promise<Response>;

export type Logger = Pick<Console, 'info' | 'warn' | 'error'>;

/** A reading request is at most 1500 characters of text; this leaves room for any escaping. */
export const MAX_BODY_BYTES = 16 * 1024;

export function json(status: number, body: unknown, headers?: HeadersInit): Response {
  const merged = new Headers(headers);
  merged.set('content-type', 'application/json; charset=utf-8');
  merged.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), { status, headers: merged });
}

export function errorJson(
  status: number,
  error: ApiErrorCode,
  message?: string,
  headers?: HeadersInit,
): Response {
  return json(status, message ? { error, message } : { error }, headers);
}

export function rateLimited(retryAfter: number | undefined, message: string): Response {
  const seconds = Math.max(1, Math.ceil(retryAfter ?? 60));
  return json(
    429,
    { error: 'rate_limited', message, retryAfter: seconds },
    { 'retry-after': String(seconds) },
  );
}

/** First x-forwarded-for hop (set by Vercel's edge), then x-real-ip. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

const LOCALHOST_ORIGIN = /^http:\/\/localhost(:\d+)?$/;

/**
 * Production is same-origin and needs no CORS. Cross-origin access is only for
 * `expo start --web` on localhost and any origins listed in ALLOWED_ORIGIN.
 */
export function isAllowedOrigin(origin: string | null, allowedOrigins: readonly string[]): boolean {
  if (!origin) return false;
  return LOCALHOST_ORIGIN.test(origin) || allowedOrigins.includes(origin);
}

export type JsonBody = { ok: true; value: unknown } | { ok: false; response: Response };

/**
 * Requiring application/json also means a cross-site browser request needs a
 * CORS preflight, which only the allowed origins pass.
 */
export async function readJsonBody(request: Request, maxBytes = MAX_BODY_BYTES): Promise<JsonBody> {
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') {
    return {
      ok: false,
      response: errorJson(415, 'invalid_request', 'Send a JSON body with content-type: application/json.'),
    };
  }
  const tooLarge = (): JsonBody => ({
    ok: false,
    response: errorJson(413, 'invalid_request', 'Request body is too large.'),
  });
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) return tooLarge();

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return tooLarge();
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, response: errorJson(400, 'invalid_request', 'Body must be valid JSON.') };
  }
}

export interface RouteOptions {
  methods: readonly string[];
  allowedOrigins: readonly string[];
  logger?: Logger;
}

/**
 * Wraps a route: answers CORS preflights, rejects other methods with 405 + Allow,
 * turns unexpected exceptions into a JSON 500, and stamps every response with
 * Cache-Control: no-store (plus CORS headers for allowed origins).
 */
export function route(options: RouteOptions, handle: Handler): Handler {
  const allow = [...options.methods, 'OPTIONS'].join(', ');
  const logger = options.logger ?? console;

  return async (request) => {
    const origin = request.headers.get('origin');
    const corsOrigin = origin && isAllowedOrigin(origin, options.allowedOrigins) ? origin : null;

    if (request.method === 'OPTIONS') {
      const headers = new Headers({ allow, 'cache-control': 'no-store', vary: 'Origin' });
      if (corsOrigin) {
        headers.set('access-control-allow-origin', corsOrigin);
        headers.set('access-control-allow-methods', allow);
        headers.set('access-control-allow-headers', 'content-type, x-demo-passcode');
        headers.set('access-control-max-age', '600');
      }
      return new Response(null, { status: 204, headers });
    }

    let response: Response;
    if (!options.methods.includes(request.method)) {
      response = errorJson(405, 'invalid_request', `Use ${options.methods.join(' or ')}.`, { allow });
    } else {
      try {
        response = await handle(request);
      } catch (error) {
        logger.error('[api] unhandled error', error);
        response = errorJson(500, 'unknown', 'Something went wrong.');
      }
    }

    const headers = new Headers(response.headers);
    headers.set('cache-control', 'no-store');
    headers.set('vary', 'Origin');
    if (corsOrigin) {
      headers.set('access-control-allow-origin', corsOrigin);
      headers.set('access-control-expose-headers', 'Retry-After');
    }
    return new Response(response.body, { status: response.status, headers });
  };
}
