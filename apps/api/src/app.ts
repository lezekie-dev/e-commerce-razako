import { OpenAPIHono } from '@hono/zod-openapi'
import { requestId } from './middleware/request-id.js'
import { errorHandler } from './middleware/errors.js'
import { authMiddleware } from './middleware/auth.js'
import { rateLimit } from './middleware/ratelimit.js'

export function createApp() {
  const app = new OpenAPIHono()

  // OpenAPI doc mount
  app.doc('/v1/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'E-Commerce API', version: '0.1.0' },
  })

  // Global middleware
  app.use('*', requestId())
  app.onError(errorHandler)

  // Public health
  app.get('/healthz', (c) => c.json({ ok: true }))

  // Authenticated routes (à monter après authMiddleware)
  app.use('/v1/*', authMiddleware)
  app.use('/v1/checkout/*', rateLimit({ limiter: 'checkout' }))
  app.use('/v1/cart/*', rateLimit({ limiter: 'cart' }))

  // TODO: mount routes
  // app.route('/v1/catalog', catalogRoutes)
  // app.route('/v1/cart', cartRoutes)
  // app.route('/v1/checkout', checkoutRoutes)
  // app.route('/v1/orders', orderRoutes)
  // app.route('/v1/users', userRoutes)
  // app.route('/v1/admin', adminRoutes)
  // app.route('/v1/webhooks/stripe', stripeWebhookRoutes)

  return app
}
