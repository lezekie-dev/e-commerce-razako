/**
 * orders — commandes.
 *
 * Cycle : pending → paid → fulfilling → shipped → delivered
 *         (terminaux : cancelled, refunded)
 *
 * - `number` : référence humaine unique (ex: "M14-2025-000123").
 * - `totalCents` : subtotal + shipping - discount, snapshotée.
 * - `shippingAddress` / `billingAddress` jsonb : snapshot défensif pour
 *   facture/archive (cf. SPEC §4 — les commandes survivent à la suppression
 *   d'adresse).
 * - OnDelete userId → 'restrict' : conservation comptable 10 ans (obligation FR).
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

import { addresses } from './addresses.js'
import { orderStatus } from './enums.js'
import { users } from './users.js'

/** Snapshot de l'adresse au moment de la commande. */
export type ShippingAddressSnapshot = {
  fullName: string
  line1: string
  line2?: string
  line3?: string
  city: string
  postalCode: string
  country: string
  region?: string
  phone?: string
}

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /** NULL autorisé pour guest checkout. */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),

    /** Numéro lisible (ex: "M14-2025-000123"). UNIQUE, généré côté service. */
    number: varchar('number', { length: 32 }).notNull().unique(),

    /** Email de contact (peut différer de users.email pour guest). */
    email: varchar('email', { length: 255 }).notNull(),

    /** Statut de la commande. */
    status: orderStatus('status').notNull().default('pending'),

    /** Devise snapshot. */
    currency: varchar('currency', { length: 3 }).notNull().default('EUR'),

    /** Sous-total articles en cents. JAMAIS de float. */
    subtotalCents: integer('subtotal_cents').notNull(),

    /** Frais de livraison en cents. */
    shippingCents: integer('shipping_cents').notNull().default(0),

    /** Remise totale en cents (coupons). */
    discountCents: integer('discount_cents').notNull().default(0),

    /** Total TTC en cents. JAMAIS de float. */
    totalCents: integer('total_cents').notNull(),

    /** Adresses snapshotées (jsonb, cf. SPEC §4). */
    shippingAddress: jsonb('shipping_address').$type<ShippingAddressSnapshot>(),
    billingAddress: jsonb('billing_address').$type<ShippingAddressSnapshot>(),

    /** FK vers l'adresse normalisée (si user connecté). SET NULL. */
    shippingAddressId: uuid('shipping_address_id').references(() => addresses.id, {
      onDelete: 'set null',
    }),

    /** Notes client (offertes, livraison). */
    customerNotes: text('customer_notes'),

    /** Code promo appliqué (optionnel). */
    couponCode: varchar('coupon_code', { length: 64 }),

    /** Métadonnées libres (analytics, idempotency key). */
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    /** Date de paiement effectif (NULL tant que pending). */
    paidAt: timestamp('paid_at', { withTimezone: true }),
    /** Date d'expédition. */
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    /** Date de livraison. */
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    /** Date d'annulation. */
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Historique "mes commandes" storefront. */
    userCreatedIdx: index('orders_user_created_at_idx').on(table.userId, table.createdAt.desc()),
    /** Back-office : file de travail par statut. */
    statusCreatedIdx: index('orders_status_created_at_idx').on(
      table.status,
      table.createdAt.desc(),
    ),
    /** Lookup guest par email (back-office). */
    emailIdx: index('orders_email_idx').on(table.email),
    /** Lookup par numéro (recherche client). */
    numberUnique: uniqueIndex('orders_number_unique').on(table.number),
    /** Filtre par coupon (analytics). */
    couponIdx: index('orders_coupon_idx').on(table.couponCode),
  }),
)

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert