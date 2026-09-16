# BLOCKERS — Arbitrages en attente user

> Chaque ligne = 1 décision à prendre. Format : `B-XX — question — arbitrage par défaut — impact si "non tranché"`.

| # | Question | Arbitrage par défaut | Impact si non tranché |
|---|---|---|---|
| **B-01** | **Nom de marque** : tu valides **Maison 14** ou autre ? | Maison 14 | Refonte identité + DS si changé tard |
| **B-02** | **Couleur accent** : tu valides **terracotta** (#C04A2A) ou autre ? | Terracotta | Aucun (variable CSS, surcharge triviale) |
| B-03 | Volume catalogue V1 | 30 produits (suffisant pour tester, scalable après) | Aucun (data seed) |
| B-04 | Comptes démo | 3 clients (Camille, Léa, Mehdi) + 1 admin (chef@14) | Aucun (script seed) |
| B-05 | Hébergeur DB | Neon (eu-west-3 Paris) | Migration DB |
| B-06 | Promo + produit hors promo | Application partielle (réduction sur les produits éligibles uniquement, ligne dédiée dans le récap) | Code promo + UI récap |
| B-07 | Panier 100% promo (0€) | **Bloqué** côté UI (CTA désactivé, message "ajoutez au moins 1 article non promu") — sécurité anti-fraude | Tunnel checkout |
| B-08 | Délai suppression compte RGPD | 30 jours (deletion différée, soft delete + cron) | Aucun (config) |
| B-09 | Analytics | Plausible (RGPD-friendly, simple, sans cookie banner) | Aucun (env var) |
| B-10 | On-call MVP | Alerte fondateur (email + SMS), pas de rotation | Aucun (PagerDuty facultatif plus tard) |
| B-11 | Région Neon | **eu-west-3 Paris** (RGPD) | Aucun (config Neon) |
| B-12 | Stack attributs produit | Table attributs typés (`name`, `value`) + JSONB metadata (`story`, `materials`) | Migration DB |
| B-13 | Stockage images | Vercel Blob (MVP) → Cloudflare R2 si > 500 MB | Migration objets |
| B-14 | Idempotence paiement | Oui — via `webhook_event.event_id UNIQUE` + check `payment_intent_id` | Webhook Stripe |
| B-15 | Symfony/vite | Next.js + Vite non utilisé (Next embarque son propre bundler) | Aucun |

---

## 🎯 Top priorité

**B-01 (nom de marque)** est le seul vrai blocage pour passer en design system. **B-02 (couleur)** est trivial à changer plus tard.

Le reste est paramétrable : le code avance avec les défauts, tu tranches quand tu veux.
