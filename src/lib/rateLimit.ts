// src/lib/rateLimit.ts
// Supports two calling styles:
// 1) rateLimit({ key, limit, windowSeconds })
// 2) rateLimit({ wallet, plan, endpoint, ip })   <-- used by your API routes
//
// NOTE: This is an in-memory limiter (resets across serverless instances).
// Good for MVP + unblocking builds. Later you can swap to KV/Redis.

export type PlanName =
  | 'observer'
  | 'observer+'
  | 'observerPlus'
  | 'analyst'
  | 'architect'
  | string;

type LegacyArgs = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type PlanArgs = {
  wallet?: string | null;
  ip?: string | null;
  plan?: PlanName | null;
  endpoint: 'ai-chat' | 'ai-summary' | 'token-scan' | string;
};

export type RateLimitArgs = LegacyArgs | PlanArgs;

export type RateLimitDecision = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  reset: number; // unix seconds
  message?: string;

  // aliases (handy if any code expects these)
  ok: boolean;
};

function normalizePlan(plan?: PlanName | null): string {
  const p = (plan || '').toString().toLowerCase().trim();
  if (p === 'observerplus' || p === 'observer+') return 'observer+';
  if (p === 'observer') return 'observer';
  if (p === 'analyst') return 'analyst';
  if (p === 'architect') return 'architect';
  return p || 'observer';
}

// Central place to tune limits (edit anytime).
function getPlanLimit(planRaw: PlanName | null | undefined, endpoint: string) {
  const plan = normalizePlan(planRaw);

  // Default window: 24h
  const windowSeconds = 60 * 60 * 24;

  // Limits (per day). Adjust these to match your tier design.
  // These are intentionally "reasonable MVP defaults".
  const table: Record<string, Record<string, number>> = {
    'token-scan': {
      'observer': 2,
      'observer+': 10,
      'analyst': 50,
      'architect': 500, // effectively unlimited for most usage
    },
    'ai-summary': {
      'observer': 2,
      'observer+': 10,
      'analyst': 50,
      'architect': 500,
    },
    'ai-chat': {
      'observer': 5,
      'observer+': 25,
      'analyst': 500,
      'architect': 5000,
    },
  };

  const endpointKey = (endpoint || '').toLowerCase();
  const perEndpoint = table[endpointKey];

  // fallback if endpoint not found
  const fallbackLimitByPlan: Record<string, number> = {
    'observer': 10,
    'observer+': 50,
    'analyst': 500,
    'architect': 2000,
  };

  const limit =
    (perEndpoint && perEndpoint[plan]) ??
    fallbackLimitByPlan[plan] ??
    10;

  return { limit, windowSeconds };
}

function store() {
  const g = globalThis as unknown as {
    __COGNI_RL__?: Map<string, { count: number; resetAtMs: number }>;
  };
  if (!g.__COGNI_RL__) g.__COGNI_RL__ = new Map();
  return g.__COGNI_RL__!;
}

function take(key: string, limit: number, windowSeconds: number): RateLimitDecision {
  const s = store();
  const now = Date.now();
  const windowMs = Math.max(1, windowSeconds) * 1000;

  const entry = s.get(key);

  // new window
  if (!entry || now >= entry.resetAtMs) {
    const resetAtMs = now + windowMs;
    s.set(key, { count: 1, resetAtMs });

    return {
      allowed: true,
      ok: true,
      used: 1,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: Math.floor(resetAtMs / 1000),
    };
  }

  // existing window
  entry.count += 1;
  s.set(key, entry);

  const allowed = entry.count <= limit;

  return {
    allowed,
    ok: allowed,
    used: entry.count,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: Math.floor(entry.resetAtMs / 1000),
    message: allowed ? undefined : 'Rate limit exceeded for your tier',
  };
}

export function rateLimit(args: RateLimitArgs): RateLimitDecision {
  // Style #1: legacy
  if ('key' in args) {
    return take(args.key, args.limit, args.windowSeconds);
  }

  // Style #2: plan-based (wallet/ip + endpoint)
  const { endpoint, wallet, ip, plan } = args;

  const id =
    (wallet && wallet.trim()) ||
    (ip && ip.trim()) ||
    'anon';

  const { limit, windowSeconds } = getPlanLimit(plan, endpoint);

  // include endpoint in key so each endpoint gets its own bucket
  const key = `${endpoint}:${id}`;

  return take(key, limit, windowSeconds);
}

export default rateLimit;

export function getClientIp(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return null;
}
