// src/lib/rateLimit.ts
export type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix timestamp seconds
};

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const { key, limit, windowSeconds } = opts;

  const g = globalThis as unknown as {
    __COGNI_RL__?: Map<string, { count: number; resetAtMs: number }>;
  };

  if (!g.__COGNI_RL__) g.__COGNI_RL__ = new Map();
  const store = g.__COGNI_RL__;

  const now = Date.now();
  const windowMs = Math.max(1, windowSeconds) * 1000;

  const entry = store.get(key);

  if (!entry || now >= entry.resetAtMs) {
    const resetAtMs = now + windowMs;
    store.set(key, { count: 1, resetAtMs });
    return {
      ok: true,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: Math.floor(resetAtMs / 1000),
    };
  }

  const newCount = entry.count + 1;
  entry.count = newCount;
  store.set(key, entry);

  const remaining = Math.max(0, limit - newCount);
  return {
    ok: newCount <= limit,
    limit,
    remaining,
    reset: Math.floor(entry.resetAtMs / 1000),
  };
}

export default rateLimit;

export function getClientIp(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return null;
}
