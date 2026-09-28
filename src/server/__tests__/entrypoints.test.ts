import { afterEach, describe, expect, it, vi } from 'vitest';

import { jsonRequest, validBody } from './helpers';

describe('api/ entry points', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('export a Web-standard fetch handler configured from process.env', async () => {
    vi.stubEnv('MOCK_AI', 'true');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('DEMO_PASSCODE', 'lotus-42');
    const { default: interpret } = await import('../../../api/interpret');
    const { default: unlock } = await import('../../../api/unlock');

    const status = await unlock.fetch(new Request('http://localhost/api/unlock'));
    expect(await status.json()).toEqual({ required: true });

    const response = await interpret.fetch(
      jsonRequest('http://localhost/api/interpret', validBody, { 'x-demo-passcode': 'lotus-42' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ kind: 'reading', language: 'en', model: 'mock' });
  });
});
