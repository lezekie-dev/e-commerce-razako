import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),
  WEB_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  DATABASE_URL: z.string().url(),

  AUTH_SECRET: z.string().min(32).describe('Auth.js JWT secret'),

  PAYMENTS_MODE: z.enum(['mock', 'live']).default('mock'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  // Lazy load dotenv only in dev
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { config } = require('dotenv')
    config()
  }
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid env')
  }
  return parsed.data
}

export const env = loadEnv()
