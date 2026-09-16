# Environnement de test déterministe

> Demandé par @QA — pour rendre Playwright/Vitest reproductibles en local ET en CI.

## Conventions imposées

| Paramètre | Valeur | Pourquoi |
|-----------|--------|----------|
| **TZ** | `Europe/Paris` | Pas de surprise d'heure d'été sur les fixtures de date |
| **LOCALE** | `fr-FR` | Cohérent avec le marché cible |
| **Devise** | `EUR` (€) | Prix catalogue, seuils Stripe |
| **Postgres TZ** | `Europe/Paris` (via PGTZ) | `now()` et `date_trunc()` déterministes |
| **Seed DB** | Fixe, voir `infra/fixtures/seed.ts` | Mêmes UUIDs, mêmes prix, mêmes stocks à chaque run |
| **Stripe webhook fixtures** | `infra/fixtures/stripe/` | Events JSON signés avec `whsec_test_…` reproductible |
| **Ports stables** | 3000 (web), 3001 (api), 5432 (pg), 6379 (redis), 8025 (mailhog), 8080 (adminer) | Pas d'allocation dynamique |

## Seed DB (`infra/fixtures/seed.ts`)

À exécuter via `pnpm db:seed` (ou auto en local via entrypoint Docker).

Contient :
- 1 admin (`admin@example.com` / mot de passe fixe)
- 5 clients démo (`alice@`, `bob@`, …)
- 30 produits répartis sur 3 catégories
- 0 commande en base (les tests créent les leurs)

Idempotent : `INSERT ... ON CONFLICT DO NOTHING` partout.

## Stripe webhook fixtures (`infra/fixtures/stripe/`)

- `payment_intent.succeeded.json`
- `payment_intent.payment_failed.json`
- `charge.refunded.json`
- `charge.dispute.created.json`

Chaque fixture est un event JSON Stripe complet, signé avec `whsec_test_dev`.
Le script `infra/fixtures/sign.ts` peut les re-signer à la volée.

## En CI

Le job `test` de `ci.yml` injecte déjà `TZ: Europe/Paris` + `PGTZ: Europe/Paris`
dans le service Postgres. Les steps `test:e2e` doivent préfixer :

```bash
TZ=Europe/Paris pnpm test:e2e
```

Et charger le seed :

```bash
pnpm db:seed:test
```

## Vérification

Pour valider que ton env est bien déterministe :

```bash
docker compose up -d postgres
TZ=Europe/Paris psql $DATABASE_URL -c "SELECT now();"
# Doit retourner la même heure (à la seconde) si tu relances dans la même seconde
# Plus important : la date_format doit matcher fr-FR
```

## Owner

@QA maintient `seed.ts` et les fixtures Stripe. @DevOps maintient le
contrat d'env (TZ, ports, DB URL) exposé par ce fichier.
