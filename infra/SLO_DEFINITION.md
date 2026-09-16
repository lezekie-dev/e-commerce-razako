# SLO definitions — Maison 14

> Basé sur Google SRE workbook. Service de référence : e-commerce maison14.fr.

## 1. Availability SLO

**Objectif : 99.9% disponibilité mensuelle** (3 nines).

**Calcul** :

```
availability = (successful_requests / total_requests) × 100
```

**Budget d'erreur mensuel** :

| Disponibilité cible | Downtime max / mois | Budget erreur / 30j |
|---|---|---|
| 99.9% | 43.2 min | 0.1% des requêtes |
| 99.95% | 21.6 min | 0.05% |
| 99.99% | 4.32 min | 0.01% |

**Exclusion** : maintenance planifiée (status page), attaques DDoS, bugs Tiers (Stripe down).

**Mesure** : uptime monitoring multi-region (Betterstack ou UptimeRobot) + Vercel Analytics + Sentry error tracking.

## 2. Latency SLO

**Objectif** :

| Endpoint | p50 | p95 | p99 |
|---|---|---|---|
| `GET /` (home) | < 100 ms | < 300 ms | < 800 ms |
| `GET /api/products` | < 80 ms | < 200 ms | < 500 ms |
| `GET /api/products/[slug]` | < 100 ms | < 250 ms | < 600 ms |
| `POST /api/cart` | < 150 ms | < 400 ms | < 1 s |
| `POST /api/checkout` | < 300 ms | < 500 ms | < 1.5 s |
| `POST /api/webhooks/stripe` | < 200 ms | < 500 ms | < 1 s |
| `GET /api/search` | < 200 ms | < 500 ms | < 1 s |

**Mesure** : Sentry Performance Monitoring + Vercel Analytics.

## 3. Error rate SLO

**Objectif : < 0.1% requêtes en erreur 5xx sur 30 jours**.

```
error_rate = (5xx_responses / total_responses) × 100
```

**Exclusion** : 4xx (client errors) — pas un SLO car reflète l'usage.

## 4. Burn rate alerts (Google SRE multi-window)

Pour SLO 99.9% (budget 0.1% sur 30j = 4320 erreurs max) :

| Alert | Fenêtre courte | Fenêtre longue | Burn rate | Action |
|---|---|---|---|---|
| **Page** | 5 min | 1h | > 14.4× | Page on-call immédiatement |
| **Ticket** | 30 min | 6h | > 6× | Ticket Slack + investigation |

**Calcul** :

```
burn_rate = (error_rate) / (1 - availability_target)
```

Pour SLO 99.9% :

- 1× burn rate = consommera 100% du budget en 30j
- 2× = en 15j
- 14.4× = en 2j (rapide → alert page)

**Burn rate alert implementation (Sentry)** :

```ts
Sentry.init({
  // ...
  beforeSendTransaction(event) {
    if (event.transaction === '/api/checkout' && event.contexts?.trace?.status === 'ok') {
      // ...
    }
    return event;
  },
});
```

Plus custom alerts dans Betterstack ou via Vercel + Slack webhook.

## 5. Error budget tracking

Dashboard Grafana :

- **Budget remaining** : gauge %, vert > 50%, jaune 20-50%, rouge < 20%
- **Burn rate** : line chart 7j glissants
- **Top failing endpoints** : table

## 6. Per-endpoint SLO

| Endpoint | Target availability | Latency p95 | Error rate |
|---|---|---|---|
| `/` | 99.95% | < 300 ms | < 0.05% |
| `/api/products` | 99.9% | < 200 ms | < 0.1% |
| `/api/cart` | 99.9% | < 400 ms | < 0.1% |
| `/api/checkout` | 99.99% | < 500 ms | < 0.01% |
| `/api/webhooks/stripe` | 99.99% | < 500 ms | < 0.01% |
| `/api/search` | 99.5% | < 500 ms | < 0.5% |
| `/api/admin/*` | 99% | < 1 s | < 1% |

`/api/checkout` et `/api/webhooks/stripe` ont les SLO les plus stricts car ils touchent au revenu.

## 7. Reporting

**Weekly** (lundi 10h UTC) :

- Burn rate des 7 derniers jours
- Top 5 erreurs Sentry
- Performance regressions éventuelles

**Monthly** (1er du mois) :

- Error budget remaining %
- Incidents count par sévérité
- SLO achievement par endpoint

## 8. Références

- Google SRE workbook : https://sre.google/workbook/alerting-on-slos/
- Sentry alerting : https://docs.sentry.io/product/alerts/
- Vercel Analytics : https://vercel.com/docs/analytics