// src/lib/rateLimit.ts
export type PlanName = 'free' | 'observer' | 'observer+' | 'analyst' | 'architect'

type LegacyArgs = {
  key: string
  limit: number
  windowSeconds: number
}

type ModernArgs = {
  wallet?: string | null
  ip?: string | null
  plan?: PlanName | null
  endpoint: string
}

export type RateLimitArgs = LegacyArgs | ModernArgs

export type RateLimitDecision = {
  allowed: boolean
  used: number
  limit: number
  remaining: number
  reset: number
  message?: string
  ok: boolean
}

function normalizePlan(plan?: PlanName | null): PlanName {
  if (!plan) return 'free'
  const p = plan.toLowerCase().trim()
  if (p.includes('architect')) return 'architect'
  if (p.includes('analyst')) return 'analyst'
  if (p.includes('observer+') || p.includes('observer plus')) return 'observer+'
  if (p.includes('observer')) return 'observer'
  return 'free'
}

function getPlanLimit(endpoint: string, planRaw?: PlanName | null) {
  const plan = normalizePlan(planRaw)
  const daily = 86400 // 24h

  const table: Record<string, Record<PlanName, number>> = {
    'token-scan': { free: 3, observer: 5, 'observer+': 20, analyst: 100, architect: 1000 },
    'ai-summary': { free: 5, observer: 10, 'observer+': 30, analyst: 150, architect: 1000 },
    'ai-chat': { free: 10, observer: 25, 'observer+': 100, analyst: 500, architect: 5000 },
    'dune-bundle': { free: 5, observer: 10, 'observer+': 30, analyst: 100, architect: 500 },
  }

  const defaults = { free: 10, observer: 20, 'observer+': 50, analyst: 200, architect: 1000 }
  const limit = table[endpoint.toLowerCase()]?.[plan] ?? defaults[plan] ?? 10

  return { limit, windowSeconds: daily }
}

const store = new Map<string, { count: number; resetAt: number }>()

function take(key: string, limit: number, windowSeconds: number): RateLimitDecision {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  let entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    entry = { count: 1, resetAt }
    store.set(key, entry)
    return { allowed: true, ok: true, used: 1, limit, remaining: limit - 1, reset: Math.floor(resetAt / 1000) }
  }

  entry.count++
  store.set(key, entry)
  const allowed = entry.count <= limit

  return {
    allowed,
    ok: allowed,
    used: entry.count,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: Math.floor(entry.resetAt / 1000),
    message: allowed ? undefined : `Rate limit exceeded (${entry.count}/${limit}). Reset in ~${Math.ceil((entry.resetAt - now) / 60000)} min`,
  }
}

export function rateLimit(args: RateLimitArgs): RateLimitDecision {
  if ('key' in args) return take(args.key, args.limit, args.windowSeconds)

  const { wallet, ip, plan, endpoint } = args
  const id = wallet?.trim() || ip?.trim() || 'anon'
  const { limit, windowSeconds } = getPlanLimit(endpoint, plan)
  const key = `${endpoint}:${id}`

  return take(key, limit, windowSeconds)
}

export function getClientIp(headers: Headers): string | null {
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip')?.trim() || null
}