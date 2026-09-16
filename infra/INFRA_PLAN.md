# INFRA_PLAN — Plateforme E-Commerce

> Cible MVP : **0 €/mois** (free tiers). Cible scale : **~50 €/mois** quand le trafic le justifie.
> Philosophie : *Minimum viable reliability* d'abord, on itère ensuite.

---

## 1. Vue d'ensemble

```
                    ┌──────────────────────────────────────────┐
                    │            Cloudflare (Free)             │
                    │   DNS + DDoS + WAF basique + SSL         │
                    └────────────────┬─────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
       ┌──────▼──────┐       ┌───────▼───────┐      ┌───────▼────────┐
       │  Vercel     │       │  Vercel       │      │  Stripe        │
       │  Production │       │  Preview/Stage│      │  (test → live) │
       │  (Free)     │       │  (Free)       │      │               │
       └──────┬──────┘       └───────┬───────┘      └────────────────┘
              │                      │
       ┌──────▼──────────────────────▼───────┐
       │   Next.js (App Router) + API routes  │
       └──────┬───────────────────────────────┘
              │
   ┌──────────┼──────────┬──────────────┐
   │          │          │              │
┌──▼──┐   ┌───▼───┐   ┌───▼────┐   ┌────▼────┐
│Neon │   │Upstash│   │Resend  │   │Sentry   │
│ PG  │   │Redis  │   │(email) │   │(errors) │
│Free │   │Free   │   │Free    │   │Free     │
└─────┘   └───────┘   └────────┘   └─────────┘
```

---

## 2. Choix d'hébergement (par composant)

| Composant | Service | Tier | Justification |
|---|---|---|---|
| **Frontend + API** | Vercel | Free (Hobby) | Support natif Next.js, CDN global, SSL auto, preview deploys par PR, build cache. Limite : 100 GB bande passante/mois, serverless functions 100 GB-h. |
| **Base de données** | Neon (Postgres serverless) | Free | 0.5 GB storage, branching DB natif (un branch par preview = test E2E en isolation), autoscaling, scale-to-zero. Supabase est une bonne **alternative** si on veut l'auth et le storage intégrés. |
| **Cache / sessions / rate-limit** | Upstash Redis | Free | 10 000 req/jour, REST API compatible edge. Suffit pour panier en session, rate-limiting et cache de lectures. |
| **Paiements** | Stripe | Test mode → Live | SDK mature, webhooks signés, dashboard. Aucune carte requise en test. |
| **Email transactionnel** | Resend | Free (3 000/mois) | Confirmations commande, reset password, reçus. SDK simple, DX Next.js. |
| **Observabilité erreurs** | Sentry | Free (5 000 events/mois) | Source maps Next.js, alertes Slack/email. |
| **DNS + protection** | Cloudflare | Free | DNS anycast, SSL, DDoS de base. |
| **CI/CD** | GitHub Actions | Free (2 000 min/mois) | Intégré au repo, secrets managés, matrix builds. |
| **Stockage assets** | Vercel Blob **ou** Cloudflare R2 | Free (Vercel 500 MB) / R2 10 GB | Images produits, uploads users. R2 préféré si > 500 MB. |

> **Décision retenue : Neon** plutôt que Supabase — le branching de DB pour les previews est décisif pour notre CI/CD et Neon reste Postgres pur (pas de vendor lock-in).

---

## 3. Environnements

| Env | Domaine | DB | Stripe | Déploiement |
|---|---|---|---|---|
| **Local** | `localhost:3000` | Postgres Docker | test mode | `docker-compose up` |
| **Preview** | URL Vercel par PR (`pr-42.vercel.app`) | Neon branch auto-créé | test mode | Auto sur push PR |
| **Staging** | `staging.example.com` | Neon branch `staging` | test mode | Auto sur push `main` |
| **Production** | `www.example.com` | Neon branch `main` | **live mode** | Manuel sur tag `v*` ou bouton Vercel |

**Séparation staging / prod** : branches DB Neon distinctes, projets Vercel distincts, clés API Stripe distinctes (test vs live), variables d'environnement distinctes.

---

## 4. Estimation coûts

### Phase MVP (lancement, < 10k visiteurs/mois)

| Service | Coût |
|---|---|
| Vercel Hobby | **0 €** |
| Neon Free | **0 €** |
| Upstash Free | **0 €** |
| Resend Free | **0 €** |
| Sentry Free | **0 €** |
| Cloudflare Free | **0 €** |
| GitHub Actions Free | **0 €** |
| Domaine (optionnel) | ~10 €/an |
| **TOTAL** | **~0 €/mois** |

### Phase scale (10k–100k visiteurs/mois)

| Service | Coût |
|---|---|
| Vercel Pro | 20 $/mois |
| Neon Launch | 19 $/mois |
| Upstash Pay-as-you-go | ~5 $/mois |
| Sentry Team | 26 $/mois |
| Resend Pro | 20 $/mois |
| **TOTAL estimé** | **~90 $/mois (~85 €)** |

### Phase croissance (> 100k visiteurs)

- Migrer vers Vercel Enterprise ou self-host sur AWS/OVH
- Neon Scale (~70 $/mois)
- Redis dédié (Upstash Pro ou ElastiCache)
- **À redéfinir quand on s'approche du seuil.**

---

## 5. Scalabilité

- **Vercel** : scale horizontal automatique (serverless), CDN edge pour assets statiques, ISR pour pages catalogue.
- **Neon** : autoscaling compute (0.25 → 4 CU à la demande), scale-to-zero en idle, read replicas via branches.
- **Upstash** : Redis distribué multi-régions, TTL sur les clés de cache.
- **Bottleneck à surveiller** : cold starts serverless (mitigation : Vercel Edge Runtime pour les routes légères, Neon min compute 0.25 pour éviter le cold start DB).
- **Images** : `next/image` + Vercel Image Optimization (gratuit jusqu'à 1000 source images/mois).

---

## 6. Backups

- **DB (Neon)** : snapshots automatiques quotidiens inclus dans tous les tiers (rétention 7 jours en Free). Point-in-time recovery (PITR) disponible.
- **Script de backup manuel** (cron GitHub Actions hebdo) : `pg_dump` vers Cloudflare R2 (10 GB gratuit).
- **Code** : Git = source de vérité. Branches protégées sur `main`.
- **Secrets** : stockés uniquement dans Vercel env vars + GitHub Secrets, **jamais commit**. Rotation documentée.
- **RTO / RPO cible** :
  - RPO ≤ 24 h (snapshots quotidiens Neon)
  - RTO ≤ 1 h (restore depuis snapshot Neon ou R2)

---

## 7. Sécurité

| Domaine | Mesure |
|---|---|
| **Secrets** | `.env.local` en local (gitignored), Vercel env vars par env, GitHub Secrets pour CI. Aucun secret dans le code, les logs ou les PR. |
| **HTTPS** | Forcé partout (HSTS preload via Cloudflare). |
| **Headers HTTP** | `next.config.js` : CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |
| **Rate limiting** | Upstash Redis + middleware Next.js (`@upstash/ratelimit`). |
| **CORS** | Restreint aux domaines connus (prod, staging). |
| **Auth** | NextAuth/Auth.js + JWT signé, rotation de clé possible. Mots de passe hashés (Argon2 ou bcrypt cost ≥ 12). |
| **Dépendances** | `npm audit` + Dependabot dans CI. |
| **Images conteneurs** | Si on passe aux containers : scan Trivy dans CI. |
| **WAF** | Cloudflare (gratuit) — règles basiques anti-bot. |
| **Stripe webhooks** | Vérification de signature obligatoire (`stripe.webhooks.constructEvent`). |
| **2FA** | Activé sur Vercel, Neon, Stripe, GitHub, Cloudflare pour tous les comptes admin. |
| **Least privilege IAM** | Chaque service a sa propre clé API, scope minimal. |

---

## 8. Environnements de configuration

Variables d'environnement critiques (à définir côté code) :

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=...
NEXTAUTH_URL=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=...

# Sentry
SENTRY_DSN=...

# App
NEXT_PUBLIC_APP_URL=...
NODE_ENV=production
```

Un fichier `.env.example` (commité, **sans valeurs**) sera fourni à l'équipe dev.

---

## 9. Roadmap infra (livraisons)

- [x] Plan infra et fichiers de base
- [ ] Provisionner Neon (projet dev + staging + prod)
- [ ] Provisionner Vercel (projet staging + prod)
- [ ] Branching DB Neon automatisé dans le workflow preview
- [ ] Configurer les alertes Sentry + uptime check
- [ ] Configurer le WAF Cloudflare en mode "essentially off"
- [ ] Documenter le runbook d'incident (rollback Vercel, restore Neon)
- [ ] Premier postmortem après le 1er incident

---

## 10. Risques connus et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Cold start Neon sur 1ère requête | Latence ~500 ms | Activer min compute 0.25 CU dès qu'on dépasse 100 req/jour |
| Quota Upstash dépassé | Panier cassé | Alerte à 80 % du quota + fallback in-memory dégradé |
| Vercel Hobby interdit usage commercial | Down prod | Passer Pro dès qu'on accepte des paiements réels |
| Fuite de secret via commit | Compromission | Gitleaks en pre-commit + CI |
| Stripe webhook perdu | Commande non honorée | Retry exponentiel + endpoint `/health` qui vérifie le dernier event |
| DDoS | Down | Cloudflare free + rate-limit middleware |

---

_Dernière mise à jour : plan initial v1 — à itérer après les premiers retours du Tech Lead._
