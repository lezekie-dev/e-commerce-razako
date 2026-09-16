# MONITORING — SLO, alertes et outils

> Cible : **détecter avant l'utilisateur**. Pas de dashboard qui pète les yeux, juste les signaux utiles.

---

## 1. Principes

1. **Symptôme utilisateur d'abord** : on alerte sur ce qui casse l'expérience, pas sur les internes.
2. **Pas d'alerte qu'on ne sait pas traiter** : si on ne sait pas quoi faire, c'est un dashboard, pas une alerte.
3. **Blameless** : les incidents sont des signaux système, jamais des jugements de personnes.
4. **Erreur budget** : quand le budget est brûlé, on arrête les features et on fiabilise.

---

## 2. SLI / SLO (targets)

### Disponibilité (Availability)
- **SLI** : `1 - (requests_with_5xx_or_timeout / total_requests)`
- **SLO** : **99.9 %** sur rolling window 30 jours (= ~43 min d'indispo autorisée/mois)
- **Mesure** : Vercel Analytics + Sentry

### Latence (Performance)
- **SLI** : `requests < 500ms / total_requests` (p95 sur pages catalogue et checkout)
- **SLO** : **95 %** des requêtes sous 500 ms
- **Mesure** : Vercel Web Vitals + Sentry Performance

### Paiements (Business critical)
- **SLI** : `webhook_stripe_success / total_webhook_events`
- **SLO** : **99.95 %** (les paiements manqués = $$$ perdu)
- **Mesure** : compteur custom dans Sentry + alertes Stripe dashboard

### Checkout funnel (conversion)
- **SLI** : `commandes_payees / sessions_panier`
- **SLO** : **≥ 60 %** (à calibrer après 1 mois de données réelles)
- **Mesure** : event tracking (PostHog ou Plausible Analytics)

---

## 3. Outils (par couche)

| Couche | Outil | Tier | Usage |
|---|---|---|---|
| **Erreurs applicatives** | Sentry | Free | Source maps Next.js, alertes, releases |
| **Uptime check** | BetterStack (ex Better Uptime) **ou** Cronitor | Free | Check HTTP toutes les 5 min, alerte email/Slack |
| **Web Vitals & RUM** | Vercel Analytics + Sentry Performance | Free | LCP, FID, CLS par page |
| **Logs applicatifs** | Vercel Logs + Axiom | Free (Vercel) / Axiom free tier | Centralisation, recherche full-text |
| **Logs DB** | Neon Dashboard + `pg_stat_statements` | Inclus | Slow queries, locks, connexions |
| **Métriques infra** | Neon + Vercel + Cloudflare dashboards | Inclus | CPU, mémoire, requêtes, cache hit ratio |
| **Analytics produit** | PostHog Cloud | Free (1M events/mois) | Funnel, feature flags, session replay |
| **Alertes** | Email + Slack webhook | - | Canal unique : `#ops-alerts` |

---

## 4. Dashboards

### Dashboard 1 — Santé globale (vue Ops)
- Statut up/down (vert/rouge)
- Latence p95 (courbe 24 h)
- Taux d'erreur 5xx (%)
- Uptime check (statut vert 24 h)
- Erreur budget restant (gauge)

### Dashboard 2 — Business (vue Product)
- Visiteurs uniques / jour
- Taux de conversion checkout
- Panier moyen
- Chiffre d'affaires / jour
- Top produits

### Dashboard 3 — Paiements (vue critique)
- Webhooks Stripe traités (succès vs échec)
- Délai moyen de traitement webhook
- Échecs 3DS / carte refusée
- Litiges ouverts

> Hébergement dashboards : Vercel ne fait pas de dashboard custom → utiliser PostHog + Sentry + Neon/Vercel natifs. Pas de Grafana au MVP (overkill).

---

## 5. Alertes (et leur runbook)

| Alerte | Condition | Sévérité | Notification | Runbook |
|---|---|---|---|---|
| 🔴 **Site down** | Uptime check échoue 3× consécutivement | P1 | Slack `#ops-alerts` + SMS | Vérifier status Vercel → roll back si déploiement fautif |
| 🔴 **Taux d'erreur > 1 %** | 5xx > 1 % sur 5 min | P1 | Slack | Lire Sentry, identifier le commit fautif, rollback |
| 🟠 **Latence p95 > 2 s** | Sur 10 min | P2 | Slack | Vérifier DB (Neon dashboard) → activer min compute si besoin |
| 🟠 **Webhook Stripe échoue** | 1 webhook en échec | P2 | Slack | Rejouer via Stripe dashboard, vérifier signature |
| 🟡 **Quota Upstash > 80 %** | Quotidien | P3 | Slack | Préparer upgrade ou implémenter fallback in-memory |
| 🟡 **Quota Neon storage > 80 %** | Quotidien | P3 | Slack | Purger les vieux logs / archiver |
| 🟡 **Certificat SSL expire < 14 j** | Quotidien | P3 | Slack | Vercel gère l'auto-renouvellement ; sinon Cloudflare |
| 🟢 **Sentry error spike** | > 50 events/min | Info | Slack | Investiguer dans la journée |

---

## 6. Log strategy

### Logs structurés (JSON)
Toutes les routes API émettent au minimum :
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "info",
  "request_id": "req_abc123",
  "route": "/api/checkout",
  "method": "POST",
  "status": 200,
  "duration_ms": 145,
  "user_id": "user_42",
  "session_id": "sess_xyz"
}
```

### Niveaux
- **ERROR** : exception non rattrapée, 5xx, échec paiement → Sentry
- **WARN** : retry, fallback, 4xx atypique → Sentry (sample 10 %)
- **INFO** : événement métier clé (commande créée, paiement réussi) → Axiom/Vercel
- **DEBUG** : dev only, jamais en prod

### Rétention
- **Vercel logs** : 7 jours (plan Free) → export hebdo vers Axiom si besoin
- **Sentry** : 30 jours
- **Axiom** : 30 jours (tier gratuit)

### PII
- **Jamais** de données carte bancaire dans les logs (Stripe gère tout)
- **Hasher** les emails dans les logs si nécessaire (`sha256(email).slice(0,12)`)
- **Masquer** les Authorization headers dans Vercel (config auto)

---

## 7. Error budget

- **Budget mensuel** : `100 % - 99.9 % = 0.1 %` = ~43 min d'indispo
- **Si brûlé en milieu de mois** : gel des déploiements features, focus sur la fiabilité
- **Si brûlé deux mois de suite** : postmortem, plan de fiabilité sur le mois suivant

---

## 8. Runbooks (emplacement)

Chaque alerte a un runbook détaillé dans `shared/ecommerce/infra/runbooks/` :
- `01-site-down.md`
- `02-high-error-rate.md`
- `03-stripe-webhook-failure.md`
- `04-db-connection-exhausted.md`
- `05-rollback-vercel.md`
- `06-restore-neon-from-backup.md`

*(À créer en parallèle des premiers incidents.)*

---

## 9. Incidents & postmortems

### Process
1. **Déclenchement** : alerte ou signalement user
2. **Ack** : dans Slack (`/incident new`)
3. **Communication** : status interne toutes les 15 min si > 30 min
4. **Mitigation d'abord** : rollback > investigation
5. **Résolution** : confirmer en monitoring, fermer l'incident
6. **Postmortem blameless** dans les 5 jours ouvrés

### Template postmortem (à créer)
- Résumé exécutif
- Timeline (détection → mitigation → résolution)
- Impact (users, revenue, durée)
- Root cause(s) — pas une personne, un système
- What went well / what went poorly
- Action items (ownés, datés)

---

## 10. On-call (phase scale)

- MVP : pas d'on-call formel, mais le fondateur reçoit toutes les alertes
- Quand l'équipe grossit : rotation hebdo via PagerDuty free tier (5 utilisateurs) ou OpsGenie
- Bonus : mode "vacances" pour éviter le burnout

---

_Document vivant — à réviser après chaque incident majeur._
