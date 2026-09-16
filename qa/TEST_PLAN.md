# 📋 Plan de Test Global — Plateforme E-Commerce

> **Version** : 1.0
> **Auteur** : QA Engineer
> **Statut** : Brouillon — à valider avec PM & Tech Lead
> **Date** : Sprint 0 (pré-livraison)
> **Owner produit** : Chief of Staff

---

## 1. 🎯 Objectifs & Contexte

Lancer une **plateforme e-commerce** (web + responsive) avec un objectif de **taux de conversion maximal**. Toute régression sur le tunnel d'achat est un blocage **go/no-go**.

### 1.1 Objectifs qualité
| # | Objectif | Mesure |
|---|----------|--------|
| O1 | Zéro régression critique sur le checkout | Bug S1/S2 bloquant = NO-GO |
| O2 | Accessibilité WCAG AA conforme | 0 violation critique axe-core |
| O3 | Performance perçue < 2.5s LCP (p75) | Lighthouse / WebPageTest |
| O4 | Compatibilité cross-browser | Chrome, Firefox, Safari (3 dernières versions majeures) |
| O5 | Mobile-first (≥ 60% du trafic attendu) | iOS Safari + Android Chrome |
| O6 | Taux de conversion ≥ benchmark sectoriel | Tracking Analytics |

---

## 2. 📦 Périmètre

### 2.1 In scope
- Authentification (login, signup, reset password, OAuth Google/Apple)
- Catalogue & recherche (filtres, tri, pagination, facettes)
- Fiche produit (variantes, stock, galerie, avis)
- Panier (ajout, modification, suppression, persistance, fusion guest→logged)
- Tunnel de checkout (adresse, livraison, paiement, récap, confirmation)
- Paiement (CB via Stripe, PayPal, Apple Pay, Google Pay)
- Compte client (historique commandes, adresses, wishlist, fidélité)
- Back-office admin (catalogue, commandes, utilisateurs, promos)
- Emails transactionnels (confirmation, expédition, facture)
- API publique (REST + GraphQL)

### 2.2 Out of scope (V2)
- Marketplace / vendeurs tiers
- App mobile native
- Internationalisation hors FR/EN
- Programme de fidélité avancé

---

## 3. 🧪 Approche & Pyramide de Tests

```
            ┌─────────────┐
            │   E2E (10%)  │  ← Playwright, parcours critiques
            ├─────────────┤
            │ Integration  │  ← API + composants React (RTL)
            │    (30%)     │
            ├─────────────┤
            │   Unit (60%) │  ← Vitest, logique métier pure
            └─────────────┘
```

### 3.1 Tests unitaires (60% — Vitest)
- **Couverture cible** : ≥ 80% lignes, ≥ 75% branches
- **Focus** : pricing, taxes, remises, validations, calculs panier, règles métier
- **Mocking** : Stripe, PayPal, services externes
- **Localisation** : `apps/*/src/**/*.test.ts(x)`

### 3.2 Tests d'intégration (30% — Vitest + MSW)
- Composants React avec Testing Library
- Endpoints API avec base de données éphémère (PostgreSQL dockerisée)
- Webhooks paiement (signatures, idempotence)

### 3.3 Tests end-to-end (10% — Playwright)
- Parcours critiques complets en navigateur réel
- **Scope minimal** : achat guest, achat logged, recherche→achat, gestion panier
- **Smoke** : homepage, login, fiche produit, checkout (sans paiement)
- **Headless en CI**, headed pour debug local

### 3.4 Tests de performance (k6 / Lighthouse CI)
- Tests de charge API (100 / 500 / 1000 RPS)
- Lighthouse CI : LCP, CLS, TBT, Speed Index
- Seuils bloquants en CI

### 3.5 Tests d'accessibilité (axe-core / pa11y / Lighthouse)
- Scan automatisé sur pages clés : home, recherche, fiche produit, panier, checkout
- Audit manuel (lecteur d'écran NVDA/VoiceOver, navigation clavier)
- Vérification **WCAG 2.1 niveau AA**
- Tests dédiés : focus visible, contraste, alternatives images, ARIA, formulaires

### 3.6 Tests de sécurité (OWASP)
- SAST : ESLint security plugin + Semgrep
- DAST : OWASP ZAP en scan passif sur staging
- Dépendances : `npm audit` + Snyk (PR bloquant si CVE high)
- Tests manuels : IDOR, injection SQL/NoSQL, XSS, CSRF, auth bypass
- Conformité PCI-DSS : **aucune donnée CB ne transite par notre serveur** (Stripe Elements / iframe)

---

## 4. 🛠️ Outils retenus

| Catégorie | Outil | Justification |
|-----------|-------|---------------|
| Unit | **Vitest** | Rapide, ESM natif, compatible Vite |
| Component | **React Testing Library** | Best practices accessibilité |
| E2E | **Playwright** | Multi-browser natif, trace viewer, parallélisation |
| API Mock | **MSW** (Mock Service Worker) | Réutilisable unit + integration + e2e |
| Performance | **k6** + **Lighthouse CI** | Charge API + audit front |
| A11y auto | **axe-core/playwright** | Standard de référence |
| Sécurité | **OWASP ZAP** + **Snyk** | Open source, CI-friendly |
| Coverage | **Istanbul / v8** | Intégré Vitest |
| Reporting | **Allure** + **Playwright HTML Report** | Visuel, historique |
| CI | **GitHub Actions** | Runners managés, matrice cross-browser |

---

## 5. 📐 Matrice de couverture par feature

| Feature | Unit | Integration | E2E | Perf | A11y | Sécu |
|---------|:----:|:-----------:|:---:|:----:|:----:|:----:|
| Login / Signup | ✅ | ✅ | ✅ | – | ✅ | ✅ |
| Recherche | ✅ | ✅ | ✅ | ✅ | ✅ | – |
| Fiche produit | ✅ | ✅ | ✅ | ✅ | ✅ | – |
| Panier | ✅ | ✅ | ✅ | – | ✅ | – |
| Checkout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Paiement | ✅ | ✅ | ✅ | ✅ | – | ✅ |
| Compte client | ✅ | ✅ | ✅ | – | ✅ | ✅ |
| Admin | ✅ | ✅ | ⚠️ | – | ⚠️ | ✅ |
| Emails | ✅ | ✅ | ⚠️ | – | – | – |

✅ = complet · ⚠️ = smoke seulement · – = N/A

---

## 6. 🚪 Critères d'entrée / sortie

### 6.1 Entry criteria
- Build déployée sur environnement de qualification
- Code merged sur la branche cible
- User story avec critères d'acceptation définis
- Données de test (seed) disponibles
- Issue tracker à jour (pas de ticket S1 ouvert)

### 6.2 Exit criteria
- 100% des scénarios critiques (checkout) passent
- 0 bug S1/S2 ouvert
- < 5 bugs S3 ouverts et acceptés par le PM
- Couverture unit ≥ 80% sur le module
- Lighthouse score ≥ 90 (Performance, A11y, Best Practices, SEO)
- Scan sécurité : 0 vulnérabilité high/critical
- Tests e2e verts sur Chrome, Firefox, Safari
- Tests manuels exploratoires documentés

### 6.3 Go / No-Go
- **GO** : tous les exit criteria remplis + validation PM + Tech Lead
- **NO-GO** : 1+ exit criteria non rempli ou bug bloquant checkout
- Décision tracée dans le **Release Report** (template Allure)

---

## 7. ⚠️ Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|:------:|:-----------:|------------|
| Bug checkout en prod | Critique | Moyenne | Tests e2e systématiques + feature flags + rollback rapide |
| Indisponibilité Stripe/PayPal | Élevé | Faible | Mocks en test, fallback message clair, monitoring |
| Régression perf | Élevé | Moyenne | Lighthouse CI bloquant, alertes Core Web Vitals |
| A11y bloquante (legal) | Élevé | Moyenne | Audit dès la conception, tests automatisés à chaque PR |
| Données CB sensibles | Critique | Faible | PCI-DSS : Stripe Elements, jamais de PAN en log |
| Multi-device bugs | Moyen | Élevé | Matrice Playwright (mobile + desktop) obligatoire |

---

## 8. 🌍 Environnements

| Env | Usage | Données | Refresh |
|-----|-------|---------|---------|
| `local` | Dev | Seed minimal | À la demande |
| `preview` (PR) | QA + review | Seed complet anonymisé | À chaque PR |
| `staging` | Pré-prod + perf | Seed production anonymisé | Hebdomadaire |
| `prod` | Utilisateurs réels | – | – |

---

## 9. 🤖 Stratégie d'automatisation

### 9.1 Quoi automatiser
- ✅ Règles métier (prix, taxes, remises, stock)
- ✅ Validations formulaires
- ✅ Parcours e2e critiques (guest checkout, logged checkout, login, recherche)
- ✅ Webhooks paiement
- ✅ Contrats API
- ✅ A11y sur pages clés

### 9.2 Quoi NE PAS automatiser
- ❌ Design / placement pixels
- ❌ Exploratoire pur (sessions dédiées)
- ❌ UX émotionnelle (subjectif)
- ❌ Tests one-shot (1 seule exécution)

### 9.3 ROI / priorité d'automatisation

| Priorité | Test | Justification |
|----------|------|---------------|
| 🔴 P0 | Checkout complet | Conversion = CA |
| 🔴 P0 | Paiement (Stripe webhook) | Flux financier |
| 🟠 P1 | Login / Signup | Entrée utilisateur |
| 🟠 P1 | Panier | Pré-checkout |
| 🟡 P2 | Recherche / Fiche produit | Découverte |
| 🟢 P3 | Wishlist / Compte client | Rétention |

---

## 10. 📊 Reporting

- **Quotidien** (sprint) : dashboard CI (GitHub Actions + Allure)
- **Hebdomadaire** : synthèse au Chief (couverture, bugs, go/no-go)
- **Par release** : Release Report (template standardisé)
- **Incidents** : remontée immédiate via `message_bot` Chief

---

## 11. 🔁 Boucle d'amélioration

1. **Rétrospective qualité** à chaque fin de sprint
2. **Bug bash** hebdomadaire (exploratoire sur la dernière livraison)
3. **Mise à jour** de ce plan à chaque milestone produit

---

*Document maintenu par le QA Engineer. Toute modification majeure doit être validée par le PM et le Tech Lead.*
