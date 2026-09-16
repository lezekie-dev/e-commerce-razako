import pino from 'pino'
import { env } from './env.js'

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.password_hash',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname' } }
      : undefined,
})
