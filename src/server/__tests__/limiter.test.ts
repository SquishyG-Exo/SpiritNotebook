import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LIMITS } from '../config';
import { createRateLimiter, GLOBAL_KEY, MemoryRateLimiter, SCOPES, type RateLimiter } from '../limiter';

async function fill(limiter: RateLimiter, scope: string, key: string, count: number) {
  for (let i = 0; i < count; i += 1) {
    expect(await limiter.check(scope, key)).toEqual({ ok: true });
  }
}

describe('MemoryRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows 8 requests per IP per minute, then says when to retry', async () => {
    const limiter = createRateLimiter(DEFAULT_LIMITS);
    const scope = SCOPES.interpretPerIpMinute;
    await fill(limiter, scope, '1.1.1.1', 8);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: false, retryAfter: 60 });

    vi.advanceTimersByTime(45_000);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: false, retryAfter: 15 });
    expect(await limiter.check(scope, '2.2.2.2')).toEqual({ ok: true });

    vi.advanceTimersByTime(15_000);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: true });
  });

  it('allows 40 readings per IP per day', async () => {
    const limiter = createRateLimiter(DEFAULT_LIMITS);
    const scope = SCOPES.interpretPerIpDay;
    await fill(limiter, scope, '1.1.1.1', 40);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: false, retryAfter: 86_400 });

    vi.advanceTimersByTime(23 * 3_600_000);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: false, retryAfter: 3_600 });

    vi.advanceTimersByTime(3_600_000);
    expect(await limiter.check(scope, '1.1.1.1')).toEqual({ ok: true });
  });

  it('caps every caller together at 300 readings per day', async () => {
    const limiter = createRateLimiter(DEFAULT_LIMITS);
    await fill(limiter, SCOPES.interpretGlobalDay, GLOBAL_KEY, 300);
    const denied = await limiter.check(SCOPES.interpretGlobalDay, GLOBAL_KEY);
    expect(denied.ok).toBe(false);
    expect(denied.retryAfter).toBe(86_400);
  });

  it('reads its limits from the config', async () => {
    const limiter = createRateLimiter({ ...DEFAULT_LIMITS, perIpPerMinute: 2 });
    await fill(limiter, SCOPES.interpretPerIpMinute, 'ip', 2);
    expect((await limiter.check(SCOPES.interpretPerIpMinute, 'ip')).ok).toBe(false);
    await fill(limiter, SCOPES.unlockPerIpMinute, 'ip', 10);
    expect((await limiter.check(SCOPES.unlockPerIpMinute, 'ip')).ok).toBe(false);
  });

  it('gives a hit back on release', async () => {
    const limiter = createRateLimiter(DEFAULT_LIMITS);
    const scope = SCOPES.interpretPerIpMinute;
    await fill(limiter, scope, 'ip', 8);
    await limiter.release(scope, 'ip');
    expect(await limiter.check(scope, 'ip')).toEqual({ ok: true });
    expect((await limiter.check(scope, 'ip')).ok).toBe(false);
  });

  it('sweeps expired buckets so memory stays bounded', async () => {
    const limiter = new MemoryRateLimiter({ s: { limit: 5, windowMs: 60_000 } });
    for (let i = 0; i < 100; i += 1) await limiter.check('s', `ip-${i}`);
    expect(limiter.size()).toBe(100);

    vi.advanceTimersByTime(61_000);
    await limiter.check('s', 'fresh');
    expect(limiter.size()).toBe(1);
  });

  it('drops the least recently used keys past the per-scope cap', async () => {
    const limiter = new MemoryRateLimiter({ s: { limit: 1, windowMs: 60_000 } }, { maxKeysPerScope: 3 });
    await limiter.check('s', 'a');
    await limiter.check('s', 'b');
    await limiter.check('s', 'c');
    expect((await limiter.check('s', 'a')).ok).toBe(false);

    await limiter.check('s', 'd');
    expect(limiter.size()).toBe(3);
    // "b" was the least recently used, so it was forgotten; "a" was not.
    expect((await limiter.check('s', 'b')).ok).toBe(true);
    expect((await limiter.check('s', 'a')).ok).toBe(false);
  });

  it('rejects unknown scopes', async () => {
    const limiter = createRateLimiter(DEFAULT_LIMITS);
    await expect(limiter.check('nope', 'ip')).rejects.toThrow('Unknown rate-limit scope');
    await expect(limiter.release('nope', 'ip')).rejects.toThrow('Unknown rate-limit scope');
  });
});
