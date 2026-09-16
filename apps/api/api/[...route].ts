/**
 * Entry pour Vercel Functions (apps/api).
 * Toute la logique d'API est exposée via `app.fetch` ; le catch-all `[...route]`
 * route toutes les requêtes vers ce handler.
 *
 * Déployé via `vercel.json` (présent à la racine apps/api).
 */
import { createApp } from '../src/app.js'

const app = createApp()

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch
export const OPTIONS = app.fetch
export const HEAD = app.fetch

export default app.fetch
