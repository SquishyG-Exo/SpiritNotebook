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
  effort: Effort;
  /** 'default' sends the server-side refusal fallback (`fallbacks: "default"`); 'off' omits it. */
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

export function readConfig(env: Env): ServerConfig {
  return {
    apiKey: text(env.ANTHROPIC_API_KEY),
    model: text(env.ANTHROPIC_MODEL) ?? brand.ai.defaultModel,
    effort: effort(env.ANTHROPIC_EFFORT),
    fallbacks: text(env.ANTHROPIC_FALLBACKS)?.toLowerCase() === 'off' ? 'off' : 'default',
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
