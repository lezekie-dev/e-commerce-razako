import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../lib/logger.js'

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') as string | undefined

  if (err instanceof HTTPException) {
    return c.json(
      {
        type: `https://errors.shop.com/http/${err.status}`,
        title: err.message,
        status: err.status,
        traceId: requestId,
      },
      err.status,
    )
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        type: 'https://errors.shop.com/validation',
        title: 'Validation failed',
        status: 400,
        code: 'validation_failed',
        issues: err.flatten(),
        traceId: requestId,
      },
      400,
    )
  }

  logger.error({ err, requestId }, 'unhandled error')
  return c.json(
    {
      type: 'https://errors.shop.com/internal',
      title: 'Internal Server Error',
      status: 500,
      code: 'internal_error',
      traceId: requestId,
    },
    500,
  )
}
