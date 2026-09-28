import type { RateLimits } from './config';

/**
 * Rate limiting for the API routes.
 *
 * MemoryRateLimiter is best effort: counters live in one serverless instance's
 * memory, so every instance (and every cold start) has its own. That is enough
 * to stop a runaway client or a casual script in a proof of concept, not a
 * determined attacker. The RateLimiter interface is what the routes depend on;
 * to share limits across instances, implement it on Redis (e.g. Upstash):
 * `check` = INCR `${scope}:${key}` + EXPIRE on the first hit, `release` = DECR.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Whole seconds until the window resets; set when `ok` is false. */
  retryAfter?: number;
}

export interface RateLimiter {
  /** Counts one hit for `key` in `scope` and says whether it is within the scope's limit. */
  check(scope: string, key: string): Promise<RateLimitResult>;
  /** Gives back one hit counted by `check`, e.g. when the model call it reserved failed. */
  release(scope: string, key: string): Promise<void>;
}

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * MINUTE_MS;

export const SCOPES = {
  interpretPerIpMinute: 'interpret:ip:minute',
  interpretPerIpDay: 'interpret:ip:day',
  interpretGlobalDay: 'interpret:global:day',
  unlockPerIpMinute: 'unlock:ip:minute',
} as const;

/** Key used for limits shared by every caller. */
export const GLOBAL_KEY = 'all';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface MemoryRateLimiterOptions {
  now?: () => number;
  /** Past this many keys in one scope the least recently used are dropped. */
  maxKeysPerScope?: number;
  /** How often expired buckets are swept out. */
  sweepIntervalMs?: number;
}

/**
 * Fixed windows that start at a key's first hit: "per day" means 24 hours from
 * the first counted request, not calendar days.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Map<string, Bucket>>();
  private readonly now: () => number;
  private readonly maxKeysPerScope: number;
  private readonly sweepIntervalMs: number;
  private nextSweepAt: number;

  constructor(
    private readonly rules: Readonly<Record<string, RateLimitRule>>,
    options: MemoryRateLimiterOptions = {},
  ) {
    this.now = options.now ?? Date.now;
    this.maxKeysPerScope = options.maxKeysPerScope ?? 10_000;
    this.sweepIntervalMs = options.sweepIntervalMs ?? MINUTE_MS;
    this.nextSweepAt = this.now() + this.sweepIntervalMs;
  }

  async check(scope: string, key: string): Promise<RateLimitResult> {
    return this.hit(scope, key);
  }

  async release(scope: string, key: string): Promise<void> {
    this.ruleFor(scope);
    const bucket = this.buckets.get(scope)?.get(key);
    if (bucket && bucket.resetAt > this.now() && bucket.count > 0) bucket.count -= 1;
  }

  /** Live buckets across all scopes. */
  size(): number {
    let total = 0;
    for (const scoped of this.buckets.values()) total += scoped.size;
    return total;
  }

  private hit(scope: string, key: string): RateLimitResult {
    const rule = this.ruleFor(scope);
    const now = this.now();
    this.sweep(now);

    let scoped = this.buckets.get(scope);
    if (!scoped) {
      scoped = new Map();
      this.buckets.set(scope, scoped);
    }

    let bucket = scoped.get(key);
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + rule.windowMs };
    // Re-inserting keeps each Map in least-recently-used order, so eviction drops idle keys.
    scoped.delete(key);
    scoped.set(key, bucket);
    while (scoped.size > this.maxKeysPerScope) {
      const oldest = scoped.keys().next().value;
      if (oldest === undefined) break;
      scoped.delete(oldest);
    }

    if (bucket.count >= rule.limit) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
    }
    bucket.count += 1;
    return { ok: true };
  }

  private sweep(now: number): void {
    if (now < this.nextSweepAt) return;
    this.nextSweepAt = now + this.sweepIntervalMs;
    for (const [scope, scoped] of this.buckets) {
      for (const [key, bucket] of scoped) {
        if (bucket.resetAt <= now) scoped.delete(key);
      }
      if (scoped.size === 0) this.buckets.delete(scope);
    }
  }

  private ruleFor(scope: string): RateLimitRule {
    const rule = this.rules[scope];
    if (!rule) throw new Error(`Unknown rate-limit scope: ${scope}`);
    return rule;
  }
}

export function createRateLimiter(
  limits: RateLimits,
  options?: MemoryRateLimiterOptions,
): MemoryRateLimiter {
  return new MemoryRateLimiter(
    {
      [SCOPES.interpretPerIpMinute]: { limit: limits.perIpPerMinute, windowMs: MINUTE_MS },
      [SCOPES.interpretPerIpDay]: { limit: limits.perIpPerDay, windowMs: DAY_MS },
      [SCOPES.interpretGlobalDay]: { limit: limits.globalPerDay, windowMs: DAY_MS },
      [SCOPES.unlockPerIpMinute]: { limit: limits.unlockPerIpPerMinute, windowMs: MINUTE_MS },
    },
    options,
  );
}
