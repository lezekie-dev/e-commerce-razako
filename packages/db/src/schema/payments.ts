/**
 * payments — transactions de paiement.
 *
 * 1 commande peut avoir N tentatives (échec carte → retry → succès = 2 rows,
 * status différent). `intentId` UNIQUE par provider ⇒ idempotence naturelle.
 *
 * - `amountCents` / `refundedAmountCents` en cents (int). JAMAIS de float.
 * - `raw jsonb` : payload Stripe complet pour audit (charges, refunds, etc.).
 * - OnDelete orderId → 'restrict' : on ne supprime JAMAIS une commande payée
 *   (obligation légale comptable 10 ans en FR).
 */

import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { paymentProvider, paymentStatus } from './enums.js'
import { orders } from './orders.js'

/** Sous-ensemble du payload Stripe (extensible via index signature). */
export type PaymentRawPayload = {
  id?: string
  amount?: number
  currency?: string
  mode?: string
  status?: string
  client_secret?: string
  payment_method?: Record<string, unknown>
  charges?: Record<string, unknown>
  latest_charge?: Record<string, unknown>
  [key: string]: unknown
}

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),

    /** Fournisseur (Stripe prod, mock dev — SPEC §7). */
    provider: paymentProvider('provider').notNull(),

    /** ID PaymentIntent côté provider (pi_xxx pour Stripe). */
    intentId: varchar('intent_id', { length: 128 }).notNull(),

    /** Statut applicatif. */
    status: paymentStatus('status').notNull().default('pending'),

    /** Montant en cents (snapshot). JAMAIS de float. */
    amountCents: integer('amount_cents').notNull(),

    /** Devise ISO 4217. */
    currency: varchar('currency', { length: 3 }).notNull().default('EUR'),

    /** Montant total remboursé en cents (0 par défaut). */
    refundedAmountCents: integer('refunded_amount_cents').notNull().default(0),

    /** Méthode de paiement (ex: 'card', 'sepa_debit'). */
    method: varchar('method', { length: 64 }),

    /** ID méthode côté provider (pm_xxx) pour re-use. */
    paymentMethodId: varchar('payment_method_id', { length: 128 }),

    /** Dernière erreur provider (NULL si succès). */
    lastError: text('last_error'),

    /** Payload brut complet pour audit. */
    raw: jsonb('raw').$type<PaymentRawPayload>(),

    /** Timestamp du succès (NULL tant que non succeeded). */
    succeededAt: timestamp('succeeded_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Idempotence : un intent par provider. */
    providerIntentUnique: uniqueIndex('payments_provider_intent_unique').on(
      table.provider,
      table.intentId,
    ),
    /** Toutes les tentatives d'une commande. */
    orderIdx: index('payments_order_id_idx').on(table.orderId),
    /** Reporting back-office (taux de succès, retry, etc.). */
    statusCreatedIdx: index('payments_status_created_at_idx').on(
      table.status,
      table.createdAt.desc(),
    ),
  }),
)

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert