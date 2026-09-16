# Changelog — Maison 14

Toutes les modifications notables de ce projet sont documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Phase 3 — CI/CD & Infrastructure

#### Added
- `.github/workflows/ci.yml` — Pipeline CI complet (lint, typecheck, tests unitaires, build, E2E Playwright)
- `.github/workflows/deploy.yml` — Deploy production avec backup DB pre-deploy, smoke tests, rollback automatique
- `.github/workflows/preview.yml` — Preview deploys par PR avec Neon DB branch dédié + commentaire bot
- `.github/workflows/backup.yml` — Backup DB nightly Neon → R2, retention 90 jours, notification Slack
- `.github/workflows/lighthouse.yml` — Lighthouse CI sur PR avec budgets (perf ≥ 90, a11y ≥ 95)
- `vercel.json` — Configuration Vercel monorepo (regions CDG1, cron jobs, security headers, redirects)
- `infra/scripts/migrate.sh` — Script migration production avec confirmation + backup automatique
- `infra/MONITORING_SETUP.md` — Setup complet Sentry + Vercel Analytics + Neon + Upstash + Slack
- `infra/INCIDENT_RESPONSE.md` — Runbook incidents avec top 10 scénarios + remediation
- `infra/SLO_DEFINITION.md` — Définitions SLO (99.9% dispo, p95 < 500ms, burn rate alerts)
- `infra/DEPLOYMENT.md` — Guide premier déploiement pas-à-pas (~2-3h)

#### Changed
- Tailwind config : ajout rampes `ink-{50..900}` + `accent-{50..900}` pour matcher tokens DS
- Next config : `remotePatterns` étendu avec `maison14.fr` + `www.maison14.fr` + `localhost`

## [0.1.0] — 2025-XX-XX — Phase 2 (code applicatif)

### Added

#### Frontend (apps/web)
- Home page complète : Hero, Collections vedettes, Produits vedettes, Footer 4 colonnes
- Root layout avec header sticky 72 px glass mutualisé
- Header avec 3 overlays Client Components (HeaderSearch, CartDrawer, MobileMenu)
- Accessibilité WCAG AA : skip-link, ARIA roles, focus-visible terracotta, Esc handler
- Responsive mobile-first (1 → 2 → 3 → 4 colonnes)
- JSON-LD Organization (SEO)
- Metadata consolidée (title template, OG, themeColor)

#### Backend (apps/api)
- Hono 4 server sur Vercel Functions
- 4 middlewares : auth, errors, ratelimit, request-id
- 3 libs : env, logger (pino), stripe mock
- Routes : `/health`, `/api/products`, `/api/cart`, `/api/checkout`, `/api/webhooks/stripe`

#### Database (packages/db)
- 13 tables Drizzle : users, addresses, categories, products, variants, product_images, stock_items, carts, cart_items, orders, order_items, payments, reviews
- 5 enums centralisés : userRole, productStatus, orderStatus, paymentProvider, paymentStatus
- Enums additionnels : addressKind
- Indexes défensifs + CHECK constraints + uniques partiels
- Snapshots prix/SKU pour conformité comptable 10 ans
- Cascade rules explicites (cascade / restrict / set null)

#### Design System (packages/ui)
- 13 composants : tokens, Button, Input, Card, Badge, Price, Container, Separator, Skeleton, Stack, cn
- Tokens rampes `ink-{50..900}` (neutres) + `accent-{50..900}` (terracotta)
- Helper `tw()` pour lookup tokens
- Type-safe variants avec CVA

#### QA
- 32 scénarios checkout documentés
- 69 acceptance criteria
- 15 AC spécifiques Home
- Playwright + axe-core helper (`expectNoA11yViolations`)
- Vitest config

#### Specs
- PRD, USER_STORIES (18 stories ~127 pts), ROADMAP, ARCHITECTURE, TECH_STACK
- HOME_DESIGN.md (Design system complet)
- ADR-0001 monorepo + pnpm + Hono + Vercel

#### Infrastructure
- INFRA_PLAN, MONITORING, ENV, docker-compose, Dockerfile.dev
- 3 GitHub Actions (initial setup)

## [0.0.1] — 2025-XX-XX — Phase 1 (specs & infra)

### Added
- Initial repo structure (monorepo pnpm + Turborepo)
- Architecture decisions
- Tech stack locked
- Infra plan initial
- QA test plan