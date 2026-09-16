# DECISIONS — Log des décisions actées

> Format : `D-XX — décision — rationale — date — owner`.

| # | Décision | Rationale | Date | Owner |
|---|---|---|---|---|
| D-01 | Stack = **Next.js 14 (App Router) + Hono + Postgres + Drizzle + Auth.js + Stripe (mock dev)** | RSC + ISR pour SEO + perfs, Hono léger et compatible Vercel Functions, Drizzle type-safe, Auth.js mature, Stripe standard | 2026-09-16 | @TechLead |
| D-02 | Monorepo **pnpm + Turborepo** sous `shared/ecommerce/` | Partage de types Zod et DS entre web/api, lockfile unique | 2026-09-16 | @TechLead |
| D-03 | Hébergement cible = **Vercel (web + api) + Neon (Postgres) + Upstash (Redis) + Resend (emails) + Sentry (erreurs) + Cloudflare (DNS/R2/WAF)** | Free tiers alignés (Vercel Hobby, Neon Free, Upstash Free, Resend Free 3k/mois, Sentry Free 5k events/mois) | 2026-09-16 | @DevOps |
| D-04 | Coût MVP = **0 €/mois** (< 10k visiteurs/mois) | Tous les free tiers se cumulent sans friction | 2026-09-16 | @DevOps |
| D-05 | SLO cible = **dispo 99.9 % · p95 < 500 ms · paiement 99.95 %** | Standard e-commerce sérieux | 2026-09-16 | @DevOps + @TechLead |
| D-06 | 4 environnements : **local / preview / staging / prod** | Preview par PR (Vercel) + Neon branch auto, staging auto sur push main, prod sur tag `v*` | 2026-09-16 | @DevOps |
| D-07 | Tests = **Vitest (unit) + Playwright (e2e) + axe-core (a11y) + OWASP ZAP (sécu)** | Stack moderne, intégration CI native | 2026-09-16 | @QA |
| D-08 | Couverture minimum = **80 %** sur packages/, **70 %** sur apps/ | Pyramide 60/30/10 (unit/int/e2e) | 2026-09-16 | @QA |
| D-09 | Gating checkout = **0 régression sur scénarios P0** (7 scénarios bloquants) | Cible conversion, tolérance zéro sur tunnel d'achat | 2026-09-16 | @QA |
| D-10 | Contrat d'erreur API = **RFC-7807** (Problem Details for HTTP APIs) | Standard, exploitable côté front | 2026-09-16 | @TechLead |
| D-11 | Design system = **maison** (cva + Tailwind + tokens), 0 kit UI | Distinction vs clones Shopify génériques | 2026-09-16 | @TechLead + @Designer |
| D-12 | Attributs produit = **table typés + JSONB metadata** | Compromis entre structure (filtres/SEO) et flexibilité (story maker) | 2026-09-16 | @PM + @TechLead |
| D-13 | Idempotence paiement = **`webhook_event.event_id UNIQUE` + `payment_intent_id` côté `order`** | Standard Stripe + double-check anti-double-charge | 2026-09-16 | @TechLead |
| D-14 | Montants = **entiers cents** (jamais `float`) | Évite les bugs d'arrondi | 2026-09-16 | @TechLead |
| D-15 | Canvas de marque = **épuré, typographique, photo plein cadre** | Distinction vs templates génériques, focus matière | 2026-09-16 | @PM |
| D-16 | Mode délégation contenu long = **Chief rédige**, agents valident | Taux d'hallucination constaté sur contenus longs > 4 KB | 2026-09-16 | @Chief |
