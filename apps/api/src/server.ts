/**
 * Entry point dev (tsx watch / node).
 * Pour Vercel Functions, voir `api/[...route].ts` qui exporte le handler.
 */
import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { env } from './lib/env.js'
import { logger } from './lib/logger.js'

serve(
  {
    fetch: createApp().fetch,
    port: Number(env.API_PORT ?? 4000),
  },
  (info) => {
    logger.info({ port: info.port }, '🚀 API listening')
  },
)
