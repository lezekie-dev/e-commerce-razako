# ADR-0001 — Monorepo pnpm + Turborepo, Hono backend sur Vercel Functions (MVP)

## Contexte

- Mission e-commerce, MVP livrable, contrainte budget 0 €/mois décidée par @DevOps.
- Besoin : front premium + SEO + SSR, backend type-safe indépendant, scale v2 possible.
- Pas d'historique legacy à respecter.

## Décisions

1. Monorepo `pnpm` + Turborepo, apps `web` et `api` séparées (pas Next full-stack).
2. `apps/web` : Next.js 14 App Router sur Vercel.
3. `apps/api` : Hono 4 + `@hono/node-server` en local, export `fetch` pour Vercel Functions en prod.
4. Schemas Zod partagés dans `packages/shared` ⇒ OpenAPI auto via `@hono/zod-openapi`.
5. Drizzle ORM + Postgres (Neon). Pas de Prisma.
6. Auth.js v5 sur le web ; JWT vérifié côté API (clé `AUTH_SECRET` partagée).
7. Stripe en mock en dev (`PAYMENTS_MODE=mock`), webhook idempotent.

## Conséquences

- Migration vers Railway/Fly.io possible au-delà du free Vercel ; seule la commande de boot change côté API.
- Limites Vercel Hobby : 10 s timeout sur les serverless functions → les jobs longs passeront par un worker Upstash Q dès qu'on en aura.
- OpenAPI consommable directement par les frontends et futurs clients (mobile).
- On garde la porte ouverte pour split front/back si la frontière netflix/dev se complexifie.

## Alternatives rejetées

- Next.js full-stack : plus simple mais couple checkout/webhooks ; perte de l'OpenAPI propre.
- tRPC : verrouille tout sur TS, mauvais pour les intégrations tierces (Stripe CLI, Apps mobile).
- GraphQL : overhead justifié seulement si > 5 clients ; ratio effort/valeur faible en MVP.
- Fastify / Express : moins moderne, plus de boilerplate, pas edge-friendly.
