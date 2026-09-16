# ENV — Contrat de variables d'environnement (Phase 2)

Document de référence. Chaque variable utilisée par l'app y est listée avec :
sa source (où récupérer la valeur), son statut `required | optional`, et la
**valeur sûre en dev** (mock ou fallback docker-compose). Les secrets ne sont
**jamais** commités : on pousse `.env.example` et on injecte les vraies
valeurs via Vercel env vars, GitHub Actions secrets, ou `.env.local` (gitignored).

Cible hébergeurs Phase 2 : **Vercel** (app) + **Neon** (Postgres eu-west-3)
+ **Upstash** (Redis) + **Stripe** (mock) + **Resend** + **Sentry** +
**Cloudflare R2** (backups/assets) + **Cloudflare** (DNS/WAF/Turnstile).

## 1. Runtime / App

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `NODE_ENV` | required | runtime | `development` |
| `NEXT_PUBLIC_SITE_URL` | required | hardcode par env (preview/staging/prod) | `http://localhost:3000` |
| `SITE_ORIGIN` | required | hardcode par env | `http://localhost:3000` |
| `NEXT_PUBLIC_LOCALE` | optional | hardcode | `fr-FR` |
| `TZ` | required | runtime | `Europe/Paris` |
| `LOG_LEVEL` | optional | runtime | `info` |

## 2. Database (Neon Postgres, région **eu-west-3**)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `DATABASE_URL` | **required** | Neon → Project → Connection Details → **Pooled** | docker-compose `postgresql://postgres:postgres@db:5432/app` |
| `DIRECT_URL` | required | Neon → Connection Details → **Direct** | idem sans `db:5432` |
| `DATABASE_REGION` | optional | pin region | `eu-west-3` |
| `DATABASE_STATEMENT_TIMEOUT_MS` | optional | defense | `15000` |

> **RGPD** : Neon region `eu-west-3` (Paris) garde les données dans l'UE.

## 3. Auth (Auth.js / NextAuth v5)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `AUTH_SECRET` | **required (non-dev)** | `openssl rand -base64 32` | dev : valeur statique connue de l'équipe |
| `AUTH_TRUST_HOST` | required sur Vercel | booléen | `true` |
| `AUTH_URL` | required | hardcode par env | `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `_SECRET` | optional | GCP Console → Credentials | vides en dev (login email uniquement) |
| `AUTH_GITHUB_ID` / `_SECRET` | optional | GitHub OAuth Apps | idem |
| `AUTH_EMAIL_FROM` | optional si magic-link | Resend verified sender | `no-reply@example.com` |

## 4. Stripe (mock Phase 2)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | **required** | Stripe Dashboard → API keys (Test) | **`sk_test_mock`** (mock Phase 2) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **required** | même écran | **`pk_test_mock`** |
| `STRIPE_WEBHOOK_SECRET` | required si webhook | `stripe listen --forward-to ...` | `whsec_mock` |
| `STRIPE_PRICE_STARTER` / `_PRO` | optional | Stripe → Products | `price_mock_*` |
| `STRIPE_CURRENCY` | optional | config code | `eur` |
| `STRIPE_API_VERSION` | optional | Stripe changelog | `2024-06-20` |

> Les valeurs `*_mock_*` court-circuitent l'appel réseau Stripe et sont
> détectées par le SDK adapter pour renvoyer des réponses déterministes.

## 5. Redis / rate-limit (Upstash)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `UPSTASH_REDIS_REST_URL` | required (prod) | Upstash Console | **vide en dev** → fallback `REDIS_URL` |
| `UPSTASH_REDIS_REST_TOKEN` | required (prod) | Upstash Console | **vide en dev** |
| `REDIS_URL` | required (dev) | docker-compose | `redis://localhost:6379` |
| `RATE_LIMIT_WINDOW_SECONDS` | optional | config | `60` |
| `RATE_LIMIT_MAX_REQUESTS` | optional | config | `60` |

## 6. Sentry

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `SENTRY_DSN` | required (staging/prod) | Sentry → Project Settings → Client Keys | **vide en dev** (Sentry no-op) |
| `NEXT_PUBLIC_SENTRY_DSN` | required (staging/prod) | idem | **vide en dev** |
| `SENTRY_AUTH_TOKEN` | required en CI | Sentry → Settings → Auth Tokens | idem |
| `SENTRY_ORG` / `SENTRY_PROJECT` | required en CI | URL Sentry | idem |
| `SENTRY_TRACES_SAMPLE_RATE` | optional | config | `0.1` |
| `SENTRY_SEND_DEFAULT_PII` | optional | config | `false` (RGPD) |

## 7. Resend (email transactionnel)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `RESEND_API_KEY` | required (staging/prod) | Resend → API Keys | **vide en dev** → MailHog (`localhost:1025`) |
| `RESEND_FROM_EMAIL` | required | Resend → Domains (verified) | `no-reply@example.com` |
| `RESEND_REPLY_TO` | optional | config | `support@example.com` |

## 8. Cloudflare R2 (backups + assets)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | required (R2) | CF dashboard sidebar | **vide en dev** (no-op backup) |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | required (R2) | R2 → API Tokens | idem |
| `R2_BUCKET` | required (R2) | nom du bucket créé | `ecommerce-dev-backups` |
| `R2_PUBLIC_URL` | optional | Workers + R2 public bucket | idem |
| `R2_ENDPOINT` | optional | override endpoint | dérivée du account ID |

## 9. Cloudflare (DNS / WAF / Turnstile)

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `CLOUDFLARE_ZONE_ID` | required (DNS) | CF → domain → Overview | **vide en dev** |
| `CLOUDFLARE_API_TOKEN` | required (DNS) | CF → My Profile → API Tokens | idem |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional | CF → Turnstile | idem |
| `TURNSTILE_SECRET_KEY` | optional | CF → Turnstile | idem |

## 10. Divers

| Var | Required | Où la récupérer | Valeur sûre en dev |
|---|---|---|---|
| `ENABLED_FLAGS` | optional | feature flag service | vide |
| `MAINTENANCE_MODE` | optional | config | `false` |
| `SEED_ADMIN_EMAIL` | dev only | seed script | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | dev only | seed script | `admin_dev_only_change_me` |
| `SEED_STRIPE_TEST_CARD` | optional | Playwright fixtures | `4242424242424242` |

## 11. Matrice par environnement

| Var | local | preview (PR) | staging | production |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `preview` | `staging` | `production` |
| `DATABASE_URL` | docker `db:5432` | Neon branch auto | Neon branch `staging` | Neon prod |
| `AUTH_SECRET` | statique dev | Vercel preview env | Vercel staging env | Vercel prod env |
| `STRIPE_SECRET_KEY` | `sk_test_mock` | `sk_test_mock` | `sk_test_…` (Stripe test) | `sk_live_…` |
| `RESEND_API_KEY` | vide (MailHog) | vide | Resend test key | Resend prod key |
| `SENTRY_DSN` | vide (no-op) | vide | Sentry staging project | Sentry prod project |
| `UPSTASH_REDIS_REST_*` | vide (REDIS_URL) | Upstash dev | Upstash dev | Upstash prod |
| `CLOUDFLARE_API_TOKEN` | vide | vide | CF staging zone | CF prod zone |

## 12. Règles d'or

1. **Aucun secret commité**. `.env` est dans `.gitignore`, seul `.env.example` est versionné.
2. **Aucun `NEXT_PUBLIC_*` secret**. Tout ce qui est préfixé `NEXT_PUBLIC_` est exposé au navigateur.
3. **Rotation** : `AUTH_SECRET` et `CLOUDFLARE_API_TOKEN` rotés tous les 90 jours.
4. **Validation CI** : le job `gitleaks` (workflow `ci.yml`) bloque tout PR qui contient un secret.
5. **Source unique de vérité** : ce fichier + `.env.example`. Tout ajout/suppression de variable passe par une PR qui touche les deux.
