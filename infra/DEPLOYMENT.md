# Deployment guide — Premier déploiement en production

> À suivre dans l'ordre. ~2-3 heures pour la première fois, 15 min ensuite.

## Pré-requis

- [ ] Repo GitHub `github.com/lezekie-dev/e-commerce-razako` accessible (SSH ed25519)
- [ ] Domaine `maison14.fr` + `www.maison14.fr` + `api.maison14.fr` achetés (gandi.net ou OVH)
- [ ] Compte Vercel (Team plan recommandé pour SSL custom + analytics avancés)
- [ ] Compte Neon (plan Launch, eu-west-3 Paris)
- [ ] Compte Upstash Redis (pay-as-you-go)
- [ ] Compte Resend (emails transactionnels, plan Pro si > 50k emails/mois)
- [ ] Compte Sentry (organisation + projet)
- [ ] Compte Cloudflare R2 (10 GB gratuits suffisent pour commencer)
- [ ] Compte Stripe (mode live activé)
- [ ] Google Cloud Console (OAuth Google provider)
- [ ] Compte GitHub (secrets repository)

## Étape 1 : Neon (PostgreSQL)

1. Créer projet `maison14-prod` région **eu-west-3 (Paris)**.
2. Copier `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED` (direct).
3. Activer **branch protection** sur `main` (no auto-delete).
4. Configurer **autoscaling** : 0.25–4 CU.
5. Activer **connection pooling** (PgBouncer, max 100 conn).

## Étape 2 : Upstash Redis

1. Créer database `maison14-prod` région **eu-west-1** (le plus proche de Neon).
2. Copier `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
3. Activer **eviction policy** : `allkeys-lru`.

## Étape 3 : Vercel

1. Importer le repo GitHub dans Vercel.
2. **Root directory** : `apps/web`.
3. **Build command** : `cd ../.. && pnpm turbo run build --filter=@ecommerce/web`.
4. **Output** : `.next`.
5. **Region** : `cdg1` (Paris).
6. Aller dans Settings → Environment Variables, ajouter :

```bash
# Core
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://maison14.fr
NEXT_PUBLIC_API_URL=https://api.maison14.fr

# Database
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...

# Auth.js
AUTH_SECRET=  # openssl rand -base64 32
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_EMAIL_SERVER=smtp://user:pass@smtp.resend.com:587
AUTH_EMAIL_FROM=no-reply@maison14.fr

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM=no-reply@maison14.fr

# Upstash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=maison14
SENTRY_PROJECT=maison14-web

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=maison14-images
R2_PUBLIC_URL=https://images.maison14.fr

# Vercel Blob (alternative)
BLOB_READ_WRITE_TOKEN=auto
```

## Étape 4 : Cloudflare R2

1. Créer bucket `maison14-images`.
2. Activer **public access** + custom domain `images.maison14.fr`.
3. Créer **API tokens** avec permissions `Object Read & Write`.

## Étape 5 : Sentry

1. Créer organisation `maison14` + projet `maison14-web`.
2. Copier DSN (Settings → Client Keys).
3. Créer auth token (Settings → Auth Tokens) avec scopes `project:releases`, `org:read`.

## Étape 6 : Stripe

1. Activer compte live (KYC).
2. Activer **Stripe Tax** si besoin.
3. Configurer webhook endpoint : `https://api.maison14.fr/api/webhooks/stripe`.
4. Events à écouter : `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`.
5. Copier webhook signing secret.

## Étape 7 : Auth.js — Google provider

1. https://console.cloud.google.com → APIs & Services → Credentials.
2. Créer OAuth 2.0 Client ID (Web application).
3. Authorized redirect URIs : `https://maison14.fr/api/auth/callback/google`.
4. Copier Client ID + Client Secret.

## Étape 8 : DNS

Configurer chez le registrar (gandi.net par exemple) :

```
A      @               76.76.21.21                ; Vercel IP
CNAME  www             cname.vercel-dns.com.      ; Vercel
CNAME  api             cname.vercel-dns.com.      ; Vercel (autre project)
CNAME  images          <R2 bucket CNAME>          ; Cloudflare

TXT    @               "v=spf1 include:_spf.resend.com ~all"
TXT    resend._domainkey.<domain>  "<DKIM from Resend>"

TXT    _dmarc          "v=DMARC1; p=quarantine; rua=mailto:dmarc@maison14.fr"
```

## Étape 9 : GitHub Secrets

Aller dans Settings → Secrets and variables → Actions, ajouter :

```
VERCEL_TOKEN=<personal token>
VERCEL_ORG_ID=<team id>
VERCEL_PROJECT_ID=<project id>

NEON_API_KEY=<neon api key>
NEON_PROJECT_ID=<neon project id>

R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com

SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

SLACK_WEBHOOK=https://hooks.slack.com/services/...

LHCI_GITHUB_APP_TOKEN=...
```

## Étape 10 : Premier deploy

```bash
# En local ou via GitHub Action
git clone git@github.com:lezekie-dev/e-commerce-razako.git
cd e-commerce-razako
./infra/scripts/migrate.sh production  # Apply DB migrations
vercel --prod  # First manual deploy to seed
```

## Étape 11 : Smoke tests post-deploy

```bash
# Health check
curl -fsS https://maison14.fr/api/health
curl -fsS https://api.maison14.fr/health

# Homepage rendering
curl -fsS https://maison14.fr | grep "Maison 14"

# Catalog API
curl -fsS https://api.maison14.fr/api/products | jq '.[0]'

# Stripe webhook
stripe trigger payment_intent.succeeded
```

## Étape 12 : Monitoring actif

- [ ] Vérifier Sentry reçoit bien une erreur de test
- [ ] Vérifier Vercel Analytics actif
- [ ] Vérifier Betterstack uptime monitor OK
- [ ] Vérifier backup DB nightly tourne (premier run manuel)

## Étape 13 : Communication

- [ ] Status page live : <https://status.maison14.fr> (Betterstack)
- [ ] Email `contact@maison14.fr` configuré (forward ou boîte)
- [ ] Twitter / Instagram / LinkedIn cohérents avec site

## Rollback

```bash
# Via Vercel
vercel rollback --token=$VERCEL_TOKEN

# Via DB migration
./infra/scripts/migrate.sh production rollback
```

## Post-deploy checklist (chaque release)

- [ ] DB migrations appliquées
- [ ] Stripe webhook test passé
- [ ] Sentry release créée
- [ ] Smoke tests verts
- [ ] Lighthouse ≥ 90 sur preview
- [ ] Pas de regression perf (p95 < SLO)
- [ ] Status page verte
- [ ] Communication interne (#deploys)

## Liens

- Repo : https://github.com/lezekie-dev/e-commerce-razako
- Status : https://status.maison14.fr (à créer)
- Sentry : https://maison14.sentry.io
- Neon : https://console.neon.tech
- Vercel : https://vercel.com/dashboard
- Stripe : https://dashboard.stripe.com