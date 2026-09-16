/**
 * reviews — avis clients sur produits.
 *
 * - 1 avis par (product_id, user_id) : un user ne peut noter qu'une fois.
 * - `rating` : entier 1..5 (validé côté API via Zod).
 * - `approved` : modération a11y (avis en attente de validation admin).
 * - `verifiedPurchase` : true si l'auteur a une commande payée contenant le
 *   produit (calculé à la création, pas de trigger).
 * - OnDelete productId → 'cascade' / userId → 'set null' (l'avis survit à la
 *   suppression du compte mais disparaît avec le produit — soft delete via
 *   product.status='archived' recommandé pour préserver les avis).
 *
 * Note : `createdAt` seul (pas `updatedAt`) — un avis n'est pas éditable après
 * publication ; en cas de modif admin, on log dans une table d'audit (Phase 2).
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { products } from './products.js'
import { users } from './users.js'

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    /** SET NULL pour préserver l'historique d'avis même si le user supprime son compte. */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

    /** Note 1..5 — CHECK constraint + validation Zod côté API. */
    rating: integer('rating').notNull(),

    /** Titre court de l'avis (max 120). */
    title: varchar('title', { length: 120 }),

    /** Corps de l'avis (markdown léger). */
    body: text('body'),

    /** Avis vérifié (auteur a acheté le produit). Dénormalisé, recalculable. */
    verifiedPurchase: boolean('verified_purchase').notNull().default(false),

    /** Modération : false = en attente, true = publié. */
    approved: boolean('approved').notNull().default(false),

    /** Nombre de "utile" (Phase 2 : table dédiée + réactions). */
    helpfulCount: integer('helpful_count').notNull().default(0),

    /** Réponse seller (admin) — optionnelle. */
    sellerResponse: text('seller_response'),
    sellerRespondedAt: timestamp('seller_responded_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Un user ne note qu'une fois le produit. */
    productUserUnique: uniqueIndex('reviews_product_user_unique').on(
      table.productId,
      table.userId,
    ),
    /** Storefront : avis approuvés d'un produit, récents. */
    productApprovedCreatedIdx: index('reviews_product_approved_created_idx').on(
      table.productId,
      table.approved,
      table.createdAt.desc(),
    ),
    /** Back-office : file de modération (non approuvés). */
    approvedIdx: index('reviews_approved_idx').on(table.approved, table.createdAt.desc()),
    /** Invariant : rating entre 1 et 5. */
    ratingRange: check('reviews_rating_range', sql`${table.rating} BETWEEN 1 AND 5`),
  }),
)

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert