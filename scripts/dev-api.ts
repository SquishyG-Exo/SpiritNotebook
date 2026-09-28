/// <reference types="node" />
/**
 * Local server for the two Vercel functions: `npm run dev:api`.
 * Point the app at it with EXPO_PUBLIC_API_BASE_URL=http://localhost:3000.
 *
 * Env comes from the shell, then .env.local, then .env (a file never
 * overrides a variable that is already set).
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

type FetchHandler = { fetch(request: Request): Promise<Response> };

const MAX_BODY_BYTES = 64 * 1024;

class BodyTooLargeError extends Error {}

function loadEnv(): void {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
    } catch {
      // A missing file is fine.
    }
  }
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buffer.byteLength;
    if (size > MAX_BODY_BYTES) throw new BodyTooLargeError();
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function toRequest(req: IncomingMessage, url: URL): Promise<Request> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
    else if (value !== undefined) headers.set(name, value);
  }
  // Vercel sets the client address; do the same so per-IP limits work locally.
  if (!headers.has('x-forwarded-for') && req.socket.remoteAddress) {
    headers.set('x-forwarded-for', req.socket.remoteAddress);
  }
  const method = req.method ?? 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : new Uint8Array(await readBody(req));
  return new Request(url, { method, headers, body });
}

async function send(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function main(): Promise<void> {
  loadEnv();
  // Imported after the env is loaded.
  const [{ default: interpret }, { default: unlock }] = await Promise.all([
    import('../api/interpret'),
    import('../api/unlock'),
  ]);
  const { readConfig } = await import('../src/server/config');
  const routes: Record<string, FetchHandler> = {
    '/api/interpret': interpret,
    '/api/unlock': unlock,
  };

  const port = Number(process.env.PORT) || 3000;
  const server = createServer((req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `localhost:${port}`}`);
    const handler = routes[url.pathname.replace(/\/+$/, '')];

    const respond = async (): Promise<Response> => {
      if (!handler) return jsonResponse(404, { error: 'invalid_request', message: 'Not found.' });
      try {
        return await handler.fetch(await toRequest(req, url));
      } catch (error) {
        if (error instanceof BodyTooLargeError) {
          return jsonResponse(413, { error: 'invalid_request', message: 'Request body is too large.' });
        }
        console.error('[dev-api] request failed', error);
        return jsonResponse(500, { error: 'unknown', message: 'Something went wrong.' });
      }
    };

    void respond()
      .then((response) => send(res, response).then(() => response.status))
      .then((status) => {
        console.log(`${req.method} ${url.pathname} ${status} ${Date.now() - started}ms`);
      })
      .catch((error: unknown) => {
        console.error('[dev-api] could not write the response', error);
        res.destroy();
      });
  });

  server.listen(port, () => {
    const config = readConfig(process.env);
    const mode = config.mockAi ? 'MOCK_AI (canned readings)' : config.apiKey ? `live, ${config.model}` : 'no ANTHROPIC_API_KEY (503 not_configured)';
    console.log(`Spirit Notebook API on http://localhost:${port}/api (${mode})`);
    console.log(`Passcode ${config.passcode ? 'required' : 'not required'}.`);
  });

  const stop = () => server.close(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
