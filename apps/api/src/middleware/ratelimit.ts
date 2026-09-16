import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const limiters: Record<string, Ratelimit | null> = {}

function getLimiter(name: 'cart' | 'checkout'): Ratelimit | null {
  if (limiters[name]) return limiters[name]
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null // dev / test → no-op

  const cfg = name === 'checkout'
    ? { limit: 10, window: '1 m' as const }
    : { limit: 60, window: '1 m' as const }

  limiters[name] = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
    analytics: true,
  })
  return limiters[name]
}

export function rateLimit(opts: { limiter: 'cart' | 'checkout' }): MiddlewareHandler {
  return async (c, next) => {
    const limiter = getLimiter(opts.limiter)
    if (!limiter) return next() // dev fallback

    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'
    const { success } = await limiter.limit(ip)
    if (!success) throw new HTTPException(429, { message: 'Too Many Requests' })
    return next()
  }
}
