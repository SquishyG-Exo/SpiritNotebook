import { brand } from '../../brand/config';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

const EFFORTS: readonly Effort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

export interface RateLimits {
  perIpPerMinute: number;
  perIpPerDay: number;
  globalPerDay: number;
  unlockPerIpPerMinute: number;
}

export interface ServerConfig {
  /** Absent when ANTHROPIC_API_KEY is unset: /api/interpret then answers 503 not_configured. */
  apiKey?: string;
  model: string;
  /** Advisor model for lab 'advisor' readings (the executor consults it before writing). */
  advisorModel: string;
  effort: Effort;
  /** 'default' sends the server-side refusal fallback (`fallbacks: "default"`); 'off' omits it. See fallbacksFor. */
  fallbacks: 'default' | 'off';
  /** When set, /api/interpret requires it in the x-demo-passcode header. */
  passcode?: string;
  /** Canned readings, no API call. Only the exact string 'true' enables it. */
  mockAi: boolean;
  limits: RateLimits;
  /** Extra CORS origins besides http://localhost:<port>. */
  allowedOrigins: readonly string[];
  maxOutputTokens: number;
}

export type Env = Readonly<Record<string, string | undefined>>;

export const DEFAULT_LIMITS: RateLimits = {
  perIpPerMinute: 8,
  perIpPerDay: 40,
  globalPerDay: 300,
  unlockPerIpPerMinute: 10,
};

function text(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function effort(value: string | undefined): Effort {
  const normalized = text(value)?.toLowerCase();
  return EFFORTS.find((level) => level === normalized) ?? 'low';
}

/**
 * The server-side refusal fallback (a beta) targets the Opus / Fable tier.
 * It is on for those models and off elsewhere unless ANTHROPIC_FALLBACKS says
 * 'on' or 'off' explicitly.
 */
export function fallbacksFor(value: string | undefined, model: string): 'default' | 'off' {
  const normalized = text(value)?.toLowerCase();
  if (normalized === 'off') return 'off';
  if (normalized === 'on' || normalized === 'default') return 'default';
  return /opus|fable|mythos/i.test(model) ? 'default' : 'off';
}

export function readConfig(env: Env): ServerConfig {
  const model = text(env.ANTHROPIC_MODEL) ?? brand.ai.defaultModel;
  return {
    apiKey: text(env.ANTHROPIC_API_KEY),
    model,
    advisorModel: text(env.ANTHROPIC_ADVISOR_MODEL) ?? 'claude-opus-5',
    effort: effort(env.ANTHROPIC_EFFORT),
    fallbacks: fallbacksFor(env.ANTHROPIC_FALLBACKS, model),
    passcode: text(env.DEMO_PASSCODE),
    mockAi: env.MOCK_AI === 'true',
    limits: {
      perIpPerMinute: positiveInt(env.RATE_LIMIT_PER_IP_PER_MINUTE, DEFAULT_LIMITS.perIpPerMinute),
      perIpPerDay: positiveInt(env.RATE_LIMIT_PER_IP_PER_DAY, DEFAULT_LIMITS.perIpPerDay),
      globalPerDay: positiveInt(env.RATE_LIMIT_GLOBAL_PER_DAY, DEFAULT_LIMITS.globalPerDay),
      unlockPerIpPerMinute: DEFAULT_LIMITS.unlockPerIpPerMinute,
    },
    allowedOrigins: (env.ALLOWED_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    maxOutputTokens: brand.ai.maxOutputTokens,
  };
}
