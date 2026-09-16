/**
 * carts — paniers (anonymes + utilisateurs).
 *
 * - Un panier appartient soit à un `userId`, soit à un `anonymousToken`
 *   (cookie signé HttpOnly, cf. SPEC §2 — cart anonyme).
 * - À la connexion, le panier anonyme est fusionné dans celui de l'utilisateur
 *   (job synchrone côté API, transactionnel).
 * - `expiresAt` : TTL dur (30 jours) — job de purge nightly.
 * - Un user ne peut avoir qu'UN seul panier "actif" à la fois
 *   (contrainte via uniqueIndex partiel sur userId WHERE expiresAt > now()).
 */

import { sql } from 'drizzle-orm'
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { users } from './users.js'

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /** Propriétaire (NULL pour panier anonyme). SET NULL sur suppression compte. */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

    /**
     * Token anonyme (cookie signé HttpOnly). NULL pour panier utilisateur.
     * Longueur 64 chars : 32 bytes hex.
     */
    anonymousToken: text('anonymous_token'),

    /** Devise du panier (snapshot pour éviter fluctuation de prix). */
    currency: text('currency').notNull().default('EUR'),

    /** Expiration (TTL 30 jours glissants, prolongé à chaque activité). */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Un user = un panier actif max (contrainte partielle). */
    userActiveUnique: uniqueIndex('carts_user_active_unique')
      .on(table.userId)
      .where(sql`${table.userId} IS NOT NULL`),
    /** Un token anonyme = un panier actif max. */
    anonymousTokenIdx: uniqueIndex('carts_anonymous_token_unique')
      .on(table.anonymousToken)
      .where(sql`${table.anonymousToken} IS NOT NULL`),
    /** Purge nightly par expires_at. */
    expiresAtIdx: index('carts_expires_at_idx').on(table.expiresAt),
    /** Lookup rapide par user. */
    userIdx: index('carts_user_id_idx').on(table.userId),
  }),
)

export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
