# Tech Stack — Plateforme E-Commerce

> Décisions techniques, justifications, et matrice de trade-offs.
> Document vivant : chaque changement de stack ⇒ ADR dans `specs/adr/`.

---

## 1. Principes directeurs

| Principe | Implication concrète |
|---|---|
| Pro et customisable | Design system maison sur primitives Tailwind, jamais de kit UI prédéfini |
| Type-safety end-to-end | TypeScript strict partout, Zod partagé FE/BE, Drizzle pour le DB |
| Perf + SEO | SSR/ISR par défaut, RSC quand pertinent, images optimisées, edge-cache |
| Scalable séparément | Front et API déployables et scalables indépendamment |
| Observabilité by design | Logs structurés, traces, métriques dès le jour 1 |
| Sécurité by default | Headers OWASP, rate-limit, validation Zod à toutes les frontières |
| DX moderne | Monorepo, un seul pnpm i, CI rapide via Turborepo cache |

---

## 2. Vue d'ensemble

```
apps/web       → Next.js 14 (App Router)        → Vercel
apps/api       → Hono (Node runtime)            → Vercel (MVP) / Railway (v2 si > Hobby)
packages/db    → Drizzle ORM + migrations       → Neon Postgres
packages/shared→ Zod schemas + types            → npm interne
packages/ui    → Design system maison           → consommé par web/admin
```

---

## 3. Frontend — apps/web

| Choix | Version | Pourquoi |
|---|---|---|
| Next.js 14 (App Router) | 14.2.x | SSR/ISR pour SEO e-commerce, RSC pour réduire le JS client, Route Handlers pour le BFF si besoin. Maturité écosystème, Vercel-ready. |
| React 18 | 18.3 | Server Components, Suspense, transitions. |
| TypeScript | 5.4 strict | Catch en dev, refactor-safe, contrats partagés. |
| Tailwind CSS | 3.4 | Utility-first, design tokens via CSS variables, zéro dépendance à un kit UI. |
| clsx + cva | latest | Composition de variants sans radix/shadcn. |
| Lucide Icons | latest | Tree-shakable, neutre, cohérent visuellement. |
| TanStack Query | 5.x | Cache client, mutations optimistes, retry, devtools. |
| next-themes | latest | Dark/light mode via CSS variables. |
| zod + react-hook-form | latest | Formulaires typés bout-en-bout, partage des schémas API. |

Pourquoi pas shadcn/ui ? shadcn fournit du code qu'on copie et qu'on adapte ; ici on veut une DS 100 % custom ⇒ primitives écrites à la main sur Tailwind (Button, Input, Dialog, Sheet, Tabs, Toast) dans packages/ui. Pas de dépendance à un design system externe.

Pourquoi pas Chakra / Mantine / MUI ? Kits opinionnés, look reconnaissable, customisation limitée, bundle lourd.

---

## 4. Backend — apps/api

| Choix | Version | Pourquoi |
|---|---|---|
| Hono | 4.x | Framework minimaliste, ultra-perf, type-safe end-to-end. Tourne sur Node, Bun, Deno, Workers. |
| @hono/node-server | latest | Adapter Node pour Vercel Functions. |
| @hono/zod-openapi | latest | Routes + schémas Zod ⇒ OpenAPI auto. Pas de duplication. |
| @hono/zod-validator | latest | Validation runtime sur chaque entrée. |
| pino + pino-http | latest | Logs JSON structurés, rédacteurs de champs sensibles. |
| zod | 3.23 | Source unique de vérité : validation + types + contrats OpenAPI. |
| @upstash/ratelimit | latest | Rate-limit distribué sans Redis à gérer (HTTP). |

Pourquoi pas Express / Fastify / Nest ?
- Express : non type-safe, middleware soup, plus de colonne vertébrale.
- Fastify : excellent, mais Hono est plus léger, plus moderne, et la même app tourne en edge demain.
- Nest : surdimensionné pour un e-commerce, overhead DI, courbe d'apprentissage.

Pourquoi pas GraphQL / tRPC ? REST + OpenAPI + Zod reste le contrat le plus simple à consommer depuis n'importe quel client (mobile futur, webhooks Stripe, intégrations tierces). tRPC est tentant mais verrouille tout sur TypeScript côté client.

---

## 5. Données — packages/db

| Choix | Version | Pourquoi |
|---|---|---|
| PostgreSQL | 16 | Transactions, JSONB, full-text search, extensions (pg_trgm, pgvector pour reco v2). |
| Drizzle ORM | 0.30+ | SQL-first, types générés, pas de runtime lourd, migrations explicites. |
| drizzle-kit | latest | Migrations versionnées (drizzle/*.sql). |
| postgres (porsager) | latest | Driver Node le plus rapide pour Postgres. |
| Neon (host) | serverless | Branching par PR, scale-to-zero, free tier dev. |

Pourquoi pas Prisma ? Prisma génère un client lourd, schema DSL caché, debug plus opaque. Drizzle = SQL réel + types. Trade-off : un poil plus verbeux.

---

## 6. Auth

- Auth.js (NextAuth v5) côté web : standard de fait, providers OAuth (Google, GitHub, Apple), Drizzle adapter, sessions DB.
- jose + cookies HttpOnly / Secure / SameSite=Lax côté API : vérification JWT signée, pas de dépendance framework, CSRF-safe.
- Lucia (alternative envisagée) : plus minimaliste mais moins d'écosystème d'adapters pour Drizzle.

Décision : Auth.js v5 sur le web, JWT vérifié côté API. Le web signe les sessions, l'API les valide via une clé partagée (AUTH_SECRET). Permet du BFF sans dupliquer les adapters.

---

## 7. Paiements — Stripe

- Stripe : standard, Stripe Checkout + Payment Intents, webhooks signés.
- stripe SDK côté API server-side : création PaymentIntent, refunds, webhooks.
- Mock dev : toggle PAYMENTS_MODE=mock ; mock server qui retourne des payment_intent.succeeded fictifs pour test local sans clé Stripe.
- Webhook handler dans apps/api : idempotent (table webhook_events), signature vérifiée.

---

## 8. Recherche et catalogue (v1)

- Postgres FTS (tsvector + pg_trgm) : suffisant pour v1, zéro infra à ajouter.
- Meilisearch / Typesense (v2) : quand le catalogue dépasse quelques milliers de SKU ou besoin de facettes riches.

---

## 9. Fichiers et assets

- @aws-sdk/client-s3 côté API : upload S3-compatible.
- Cloudflare R2 en prod : pas de frais egress, S3-compatible.
- next/image + loader R2 côté web : optimisation d'images, AVIF/WebP, responsive.
- Stockage des photos en URL signée : pas de bytes qui passent par l'API.

---

## 10. Cache et sessions

- Upstash Redis (serverless) : cache produit featured, sessions scale-out, rate-limit.
- HTTP cache (Cache-Control, stale-while-revalidate) sur les routes publiques : réduit la charge DB de 80 %+ sur les fiches produit.

---

## 11. Emails transactionnels

- Resend + React Email : DX excellente, templates versionnés en JSX, faible coût.

---

## 12. Observabilité

- pino (logs structurés JSON) : standard, perf, redaction.
- OpenTelemetry SDK (traces) + hook Sentry/Datadog : adopter plus tard sans réécrire.
- Sentry côté web + API : error tracking, source maps, perf.
- Vercel Analytics + Speed Insights : Core Web Vitals out-of-the-box.
- Better Stack / Logtail pour centraliser les logs : tail sur pino prod.

---

## 13. Tests

| Type | Outil | Périmètre |
|---|---|---|
| Unit | Vitest | Fonctions pures, services, utilitaires Zod. |
| Integration | Vitest + Testcontainers (Postgres ephemeral) | Repos Drizzle, handlers API avec DB réelle. |
| E2E | Playwright | Parcours critiques : sign-up, recherche → panier → checkout, admin CRUD. |
| Visual regression | Playwright toHaveScreenshot | Composants packages/ui (DS). |
| Contract | Schéma OpenAPI + schemathesis | Vérifie que l'API respecte son contrat OpenAPI. |
| Load | k6 (ponctuel) | Smoke sur checkout avant lancement. |

Cible : >80 % de coverage sur packages/* et apps/api/src/services/*.

---

## 14. Tooling

- pnpm 9.x : package manager (workspace).
- Turborepo : orchestration des builds, cache partagé, pipelines.
- ESLint flat config : lint partagé (config dans packages/eslint-config).
- Prettier : formatage unique.
- @typescript-eslint : règles type-aware.
- husky + lint-staged : pre-commit.
- commitlint + Conventional Commits : historique lisible, changelog auto.
- changesets : versioning des packages + changelog.
- GitHub Actions : CI lint, typecheck, test, build, preview deploys Vercel (web + api).

---

## 15. Déploiement

| App | Plateforme | Raison |
|---|---|---|
| apps/web | Vercel | SSR, ISR, edge functions, previews par PR, CDN global. |
| apps/api | Vercel Functions (MVP, 0 €/mois) ; Railway / Fly.io (v2 si > Hobby) | Node runtime standard, scale horizontal, prix linéaire. |
| Postgres | Neon | Branching DB par PR, serverless. |
| Redis | Upstash | Serverless, HTTP, compatible edge. |
| Stockage fichiers | Cloudflare R2 | S3, 0 egress. |
| DNS | Cloudflare | Proxy, WAF de base, cache. |
| Secrets | Doppler / 1Password CLI / Vercel env | Rotation, audit. |

---

## 16. Matrice de décision (extrait)

| Alternative rejetée | Pourquoi non |
|---|---|
| Remix | Moins de momentum, écosystème Next plus large. |
| SvelteKit | Tuyau de talent plus fin, plugins e-commerce moins nombreux. |
| Payload / Medusa headless | On garde la main sur le métier, monolithe classique = dette. |
| MongoDB | Pas de transactions multi-doc solides avant 4.0, schéma e-commerce = relationnel. |
| Supabase Postgres | Excellent, mais le dashboard admin confondu avec le runtime ; on veut séparer DB/API/Web. |
| Chakra UI / Mantine / MUI | Look reconnaissable ⇒ veto design premium. |
| Auth0 / Clerk | Vendor lock-in, coûts à l'échelle, RGPD : on préfère Auth.js. |

---

## 17. Versions cibles (snap)

Verrouillées dans le package.json racine via pnpm.overrides et pnpm.catalog (Turborepo 2.x).

- node 20.11 LTS
- pnpm 9.x
- typescript 5.4
- next 14.2.x
- react 18.3.x
- hono 4.x
- drizzle-orm 0.30+
- zod 3.23
- stripe 16.x
- vitest 1.6
- playwright 1.44
