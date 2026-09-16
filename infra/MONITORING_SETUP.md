# Monitoring setup — Phase 3

Stack : **Sentry** (errors + perf) + **Vercel Analytics** (RUM) + **Neon** (DB metrics) + **Upstash** (Redis metrics) + **Slack** (alerting).

## 1. Sentry

### Variables d'env

```bash
# .env.production
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=maison14
SENTRY_PROJECT=maison14-web
SENTRY_AUTH_TOKEN=sntrys_...  # GitHub secret uniquement
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Installation apps/web

```bash
pnpm --filter @ecommerce/web add @sentry/nextjs
```

### sentry.client.config.ts

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% des transactions
  replaysSessionSampleRate: 0.01, // 1% des sessions
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
```

### Source maps upload (CI)

`@sentry/webpack-plugin` configuré dans `next.config.mjs` :

```js
import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
```

## 2. Vercel Analytics

Activer dans Vercel dashboard → Project → Analytics → Enable.

Env (auto) :

```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto
```

Dans `apps/web/app/layout.tsx` :

```tsx
import { Analytics } from '@vercel/analytics/react';
// ...
<Analytics />
```

## 3. Neon

Dashboard : https://console.neon.tech

Variables d'env :

```bash
DATABASE_URL=postgres://user:pass@ep-xxx.eu-west-3.aws.neon.tech/maison14?sslmode=require
DATABASE_URL_UNPOOLED=postgres://user:pass@ep-xxx.eu-west-3.aws.neon.tech/maison14?sslmode=require
```

Branching strategy :

- `main` → production (eu-west-3, autoscaling 0.25–4 CU)
- `preview-pr-N` → preview par PR (autodeleted 7 jours après close)
- `staging` → staging manuel (autoscaling 0.25–1 CU)

## 4. Upstash Redis

Dashboard : https://console.upstash.com

Env :

```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

Usage : rate limiting, cache catalogue, sessions Stripe idempotence, TTL paniers 24h.

## 5. Slack alerting

Webhook URL dans `SLACK_WEBHOOK` (GitHub secret). Channel `#ops-alerts`.

Alertes configurées :

| Source | Trigger | Channel | On-call |
|---|---|---|---|
| Sentry | Error count > 100/h | #ops-alerts | PagerDuty |
| Vercel | Build fail | #deploys | — |
| Vercel | Function 5xx > 0.1% | #ops-alerts | PagerDuty |
| GitHub Action | Backup fail | #ops-alerts | PagerDuty |
| Sentry | Performance p95 > 1s | #perf | — |
| Custom | SLO burn rate alert | #ops-alerts | PagerDuty |

## 6. Dashboards Grafana (optionnel)

Provisionner via Terraform (infra/grafana/) :

- Latence p50/p95/p99 par endpoint
- Taux d'erreur par route
- Cart abandonment funnel
- Conversion rate checkout
- Stock outs imminents
- Stripe webhook success rate

## 7. Logs centralisés

Vercel logs (CDN + Functions) → exportés vers Datadog ou Logflare via webhook.

Format JSON structuré via `pino` dans `apps/api`.

## 8. Uptime monitoring

- **Betterstack** ou **UptimeRobot** : check toutes les 60s sur `/`, `/api/health`, `/api/webhooks/stripe`.
- Multi-region : Paris, Frankfurt, Dublin (CDG + FRA + DUB).

## 9. Runbooks

Voir `infra/INCIDENT_RESPONSE.md`.