import Stripe from 'stripe'
import { env } from './env.js'
import { logger } from './logger.js'

/**
 * Stripe wrapper : bascule en mock selon env.PAYMENTS_MODE.
 * Le mock renvoie des objects ressemblant à l'API Stripe pour les tests locaux.
 */

interface PaymentIntentLike {
  id: string
  client_secret: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded'
}

let realClient: Stripe | null = null

function getClient(): Stripe {
  if (!realClient) {
    if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set in live mode')
    realClient = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  }
  return realClient
}

export async function createPaymentIntent(args: {
  amount: number
  currency: string
  metadata?: Record<string, string>
}): Promise<PaymentIntentLike> {
  if (env.PAYMENTS_MODE === 'mock') {
    logger.info({ amount: args.amount, currency: args.currency }, 'mock payment_intent.create')
    const id = `pi_mock_${Math.random().toString(36).slice(2, 10)}`
    return { id, client_secret: `${id}_secret_mock`, status: 'requires_payment_method' }
  }
  const pi = await getClient().paymentIntents.create({
    amount: args.amount,
    currency: args.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: args.metadata,
  })
  return { id: pi.id, client_secret: pi.client_secret ?? '', status: pi.status as PaymentIntentLike['status'] }
}
