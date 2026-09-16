import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { jwtVerify } from 'jose'
import { env } from '../lib/env.js'

// Mêmes secret côté web (Auth.js) — JWT signé HS256
const secret = () => new TextEncoder().encode(env.AUTH_SECRET)

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('authorization') ?? c.req.header('cookie')
  const token = extractToken(auth)
  if (!token) throw new HTTPException(401, { message: 'Unauthorized' })
  try {
    const { payload } = await jwtVerify(token, secret())
    c.set('user', { id: String(payload.sub), email: String(payload.email ?? ''), role: String(payload.role ?? 'user') })
    await next()
  } catch {
    throw new HTTPException(401, { message: 'Invalid token' })
  }
}

function extractToken(headerOrCookie?: string | null): string | null {
  if (!headerOrCookie) return null
  if (headerOrCookie.startsWith('Bearer ')) return headerOrCookie.slice(7)
  const match = headerOrCookie.match(/(?:^|;\s*)(?:__Host-)?session=([^;]+)/)
  return match ? decodeURIComponent(match[1] ?? '') : null
}
