/**
 * addresses — carnet d'adresses utilisateur.
 *
 * Polymorphique via `kind` (shipping | billing), un user peut avoir N adresses,
 * une seule marquée isDefault par kind. Cascade sur user : suppression du compte ⇒
 * suppression des adresses (RGPD-friendly, pas d'orphelins).
 */

import { pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { users } from './users.js'

export const addressKind = pgEnum('address_kind', ['shipping', 'billing'])
export type AddressKind = (typeof addressKind.enumValues)[number]

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    kind: addressKind('kind').notNull().default('shipping'),

    /** Civilité (M./Mme/Mx) — optionnelle, format libre. */
    fullName: varchar('full_name', { length: 255 }).notNull(),

    /** Ligne 1 (obligatoire). */
    line1: varchar('line1', { length: 255 }).notNull(),
    /** Ligne 2 (complément : étage, bâtiment, etc.). */
    line2: varchar('line2', { length: 255 }),
    /** Ligne 3 (rare, ex: cedex). */
    line3: varchar('line3', { length: 255 }),

    city: varchar('city', { length: 128 }).notNull(),
    /** Code postal / ZIP. Stocké en string pour gérer tous les formats (FR, US, JP…). */
    postalCode: varchar('postal_code', { length: 32 }).notNull(),
    /** ISO 3166-1 alpha-2 (FR, US…). Validé côté API. */
    country: varchar('country', { length: 2 }).notNull(),

    /** Région / état (US, CA, JP…). Optionnel — obligatoire pour certains pays au checkout. */
    region: varchar('region', { length: 128 }),

    /** E.164 international, optionnel. */
    phone: varchar('phone', { length: 32 }),

    /** Adresse par défaut pour ce user+kind. Une seule active via index partiel (cf. migration). */
    isDefault: boolean('is_default').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('addresses_user_id_idx').on(table.userId),
    /**
     * Empêche deux adresses "default" pour le même (user, kind).
     * Index partiel recommandé en migration pour isDefault=true uniquement.
     */
    defaultPerKindUnique: uniqueIndex('addresses_user_kind_default_unique')
      .on(table.userId, table.kind)
      .where(sql`${table.isDefault} = true`),
  }),
)

export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert