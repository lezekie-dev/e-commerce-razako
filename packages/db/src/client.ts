import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

// Pool sizing : ajuste selon hébergeur (Neon serverless = petit pool)
const sql = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idle_timeout: 30,
  connect_timeout: 10,
})

export const db = drizzle(sql, { schema })
export type DB = typeof db
export { schema }
