/**
 * users — comptes clients + back-office.
 *
 * Source d'identité partagée (web + api). Le mot de passe est géré par Auth.js (web)
 * qui hash via argon2id ; ici on stocke uniquement le hash. Les sessions sont des JWT
 * signés côté web (cf. SPEC §6).
 */

import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, varchar, index } from 'drizzle-orm/pg-core'

import { userRole } from './enums.js'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /** Identifiant de connexion. Indexé (UNIQUE implicite via .unique()). */
    email: varchar('email', { length: 255 }).notNull().unique(),

    /** Nom affiché (peut être différent du nom légal). Optionnel à l'inscription OAuth. */
    name: varchar('name', { length: 255 }),

    /** Hash argon2id (ou NULL pour comptes OAuth-only). Jamais en clair. */
    passwordHash: text('password_hash'),

    /** Rôle applicatif (RBAC). Défaut : 'customer'. */
    role: userRole('role').notNull().default('customer'),

    /** Photo de profil (URL R2). Optionnel. */
    image: text('image'),

    /** Email vérifié ? Utilisé pour bloquer certaines actions (commande, avis). */
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Lookup rapide par email (login). */
    emailIdx: index('users_email_idx').on(table.email),
    /** Filtre admin : derniers inscrits. */
    createdAtIdx: index('users_created_at_idx').on(table.createdAt.desc()),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert