# Incident response runbook — Maison 14

## Severity levels

| Sev | Definition | Example | Response time | Resolution target |
|---|---|---|---|---|
| **P0** | Service down, perte financière immédiate, données compromises | Checkout down, DB inaccessible, Stripe webhook bloqué | < 5 min | < 1h |
| **P1** | Fonctionnalité critique dégradée, impact client majeur | Catalogue en erreur 500, paiement sporadique, emails non envoyés | < 15 min | < 4h |
| **P2** | Fonctionnalité mineure impactée, pas de perte directe | Erreurs admin, lenteur non-bloquante, bug UI isolé | < 1h | < 24h |
| **P3** | Cosmétique, pas d'impact client, dette technique | Typos, badges mal alignés, warning console | < 1 jour ouvré | < 1 sprint |

## On-call rotation

| Role | Person | Backup |
|---|---|---|
| Tech Lead | TL principal | Tech Lead secondaire |
| DevOps | DevOps principal | DevOps secondaire |
| Frontend | Frontend Dev principal | Frontend Dev secondaire |
| Backend | Backend Dev principal | Backend Dev secondaire |

Rotation : weekly, lundi 10h UTC. Schedule : PagerDuty / Opsgenie.

## Top 10 incidents probables + remediation

### 1. Checkout 500 / paiement impossible (P0)

**Symptômes** : clients voient "Une erreur est survenue" au step paiement, Sentry spike sur `POST /api/checkout`.

**Diagnostics** :

```bash
# Check Stripe webhook health
curl -fsS https://api.maison14.fr/api/webhooks/stripe/health

# Check error rate
vercel logs --since=10m --filter='error' | grep checkout

# Check Neon connection
psql "$DATABASE_URL" -c 'SELECT 1'
```

**Causes probables & fixes** :

| Cause | Diagnostic | Fix |
|---|---|---|
| Stripe API down | https://status.stripe.com | Wait, fallback to manual capture |
| Neon connection pool exhausted | `pg_stat_activity` | Scale up, increase pool size |
| API key expired | Vercel env | Rotate, redeploy |
| Drizzle migration pending | `drizzle-kit list` | Apply migration |
| Code regression | `git log --since=1h` | Rollback via `vercel rollback` |

**Communication** :

- Banner site : "Nous rencontrons un incident sur les paiements. Veuillez réessayer dans quelques minutes."
- Email : transactionnel Resend template `incident-checkout.md`
- Status page : update <https://status.maison14.fr>

### 2. DB down / connection refused (P0)

**Diagnostics** :

```bash
psql "$DATABASE_URL" -c 'SELECT 1' 2>&1
neonctl projects list
curl -fsS https://console.neon.tech/api/v2/health
```

**Fix** :

1. Vérifier Neon status : https://neonstatus.com
2. Si Neon OK → vérifier pooler PgBouncer (Neon pgbouncer)
3. Vérifier IP allowlist Vercel → Neon
4. Restart function Vercel si besoin

### 3. Stock_items over-selling (P0)

**Symptômes** : clients paient pour produit en rupture, fulfilment impossible.

**Diagnostics** :

```sql
SELECT variant_id, on_hand, reserved
FROM stock_items
WHERE reserved > on_hand;
```

**Fix** :

1. Stop Stripe webhook processing (pause incoming orders)
2. Réaligner `on_hand` avec inventaire physique
3. Refund automatique des commandes affectées via Stripe API
4. Email clients : "Désolé, rupture — voici votre remboursement"
5. Post-mortem : pourquoi le check `reserved <= on_hand` n'a pas été respecté

### 4. Auth.js provider down (P1)

**Symptômes** : impossible de se connecter, magic link email non reçu.

**Diagnostics** :

- Resend status : https://status.resend.com
- Auth.js logs Vercel
- DKIM/SPF check : mail-tester.com

**Fix** :

1. Si Resend down → fallback via SMTP secondaire (Mailgun)
2. Si DKIM cassé → vérifier DNS `resend._domainkey.maison14.fr`
3. Si trop d'emails bloqués → check spam folder + Postmaster Tools

### 5. CDN cache stale après deploy (P1)

**Symptômes** : clients voient ancienne version du site.

**Fix** :

```bash
vercel cache purge --token=$VERCEL_TOKEN
# Ou via dashboard : Project → Settings → Data Cache → Purge
```

### 6. Lighthouse perf regression (P2)

**Symptômes** : PR ouvre le dashboard, score perf < 90.

**Action** :

1. `pnpm build && pnpm start`
2. Chrome DevTools → Performance → Identify bottlenecks
3. Souvent : images non-optimisées, fonts preload, JS bundle trop gros
4. Fix en M2 : lazy load, dynamic import, font subset

### 7. Vercel build fail (P2)

**Action** :

1. `vercel logs <build-id>`
2. Souvent : type error, peer dep conflict, env var manquant
3. Fix local + push → CI catch

### 8. GitHub Action fail (P3)

Souvent flaky. Re-run avec `workflow_dispatch`.

### 9. Sentry quota dépassé (P3)

Augmenter quota ou filtrer (`beforeSend`).

### 10. Backup R2 fail (P2)

`rclone` logs → vérifier credentials R2. Si R2 down → fallback backup local /tmp + retry.

## Communication template (P0/P1)

```
[SEV-P0] Checkout down — investigating
Time: 2025-XX-XX HH:MM UTC
Impact: Clients cannot complete purchase
Detection: Sentry alert + customer report
Status: Investigating
Next update: 15 min
Owner: @oncall
```

## Post-mortem template

Voir `infra/post-mortems/YYYY-MM-DD-incident.md`.

Doit inclure :

1. **Timeline** (UTC, qui, quoi)
2. **Root cause** (pas le symptôme)
3. **Impact** (€ perdu, clients affectés, durée)
4. **What went well / wrong** (honest)
5. **Action items** (owners, deadlines)
6. **Lessons learned**

Publié en interne, blameless.