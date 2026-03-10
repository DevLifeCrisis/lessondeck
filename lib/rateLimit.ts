/**
 * Simple in-memory rate limiter.
 * Uses a Map keyed by identifier (IP or userId) storing { count, windowStart }.
 * Not distributed — resets on server restart. For production scale, swap with Upstash Redis.
 */

interface RateEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateEntry>()

export interface RateLimitConfig {
  /** Max requests allowed per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now - entry.windowStart > config.windowMs) {
    // New window
    store.set(identifier, { count: 1, windowStart: now })
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs }
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + config.windowMs,
    }
  }

  entry.count += 1
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.windowStart + config.windowMs,
  }
}

/**
 * Extract a meaningful identifier from the request headers.
 * Falls back to a fixed string if no IP is available (e.g. local dev).
 */
export function getRequestIdentifier(req: Request, prefix: string): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `${prefix}:${ip}`
}
