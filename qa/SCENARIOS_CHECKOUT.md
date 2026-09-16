# 🛒 Scénarios de Test — Tunnel d'Achat (Checkout)

> **Version** : 1.0
> **Auteur** : QA Engineer
> **Priorité** : 🔴 P0 — Bloquant pour toute release
> **Cible** : 0 régression sur la conversion

---

## 🎯 Contexte

Le tunnel d'achat est composé de **6 étapes** :
1. **Panier** (review)
2. **Authentification** (guest / login / signup)
3. **Adresse** (livraison + facturation)
4. **Livraison** (mode + créneau)
5. **Paiement** (CB / PayPal / wallet)
6. **Confirmation** (page de merci + email)

Chaque étape peut être **abandonnée** (CTA retour, croix, back navigateur). Toutes les étapes doivent être **testées nominaux ET en erreur**.

### Données de test Stripe (cartes)
| Carte | Scénario |
|-------|----------|
| `4242 4242 4242 4242` | Succès |
| `4000 0027 6000 3184` | Succès (3D Secure requis) |
| `4000 0000 0000 0002` | Refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `4000 0000 0000 0069` | Carte expirée |
| `4000 0000 0000 0127` | CVC incorrect |

---

## ✅ Scénarios nominaux (parcours heureux)

### 🟢 CHECK-01 — Achat guest complet (CB) — *Happy path principal*
**Priorité** : 🔴 P0
**Préconditions** : panier avec 1 produit en stock, visiteur non connecté.
**Étapes** :
1. Ajouter un produit depuis la fiche produit
2. Aller au panier → cliquer "Passer commande"
3. Saisir email (guest) → créer compte optionnel refusé
4. Saisir adresse de livraison valide (FR)
5. Choisir mode livraison standard
6. Saisir CB valide (`4242 4242 4242 4242`)
7. Valider le paiement
8. Vérifier redirection page confirmation
9. Vérifier email de confirmation reçu

**Résultat attendu** :
- Commande créée avec statut `pending` puis `paid`
- Email envoyé sous 30s
- Panier vidé
- Stock décrémenté
- ID de transaction Stripe enregistré

---

### 🟢 CHECK-02 — Achat utilisateur connecté (CB)
**Priorité** : 🔴 P0
**Préconditions** : utilisateur connecté, adresse enregistrée.
**Étapes** :
1. Ajouter 2 produits au panier
2. Passer commande
3. Choisir l'adresse enregistrée
4. Sélectionner livraison express
5. Payer en CB
6. Confirmer

**Résultat attendu** : commande créée, adresse par défaut appliquée, fidélité incrémentée.

---

### 🟢 CHECK-03 — Achat avec PayPal
**Priorité** : 🟠 P1
**Préconditions** : panier rempli.
**Étapes** : checkout normal → étape paiement → cliquer **PayPal** → redirection → payer → retour.
**Résultat attendu** : commande confirmée, `payment_method = paypal`, transaction ID PayPal enregistré.

---

### 🟢 CHECK-04 — Achat avec Apple Pay / Google Pay
**Priorité** : 🟠 P1
**Préconditions** : navigateur compatible (Safari pour Apple Pay, Chrome pour Google Pay).
**Étapes** : étape paiement → sélection wallet → authentification biométrique → confirmation.
**Résultat attendu** : paiement validé, méthode enregistrée.

---

### 🟢 CHECK-05 — Achat avec code promo valide
**Priorité** : 🟠 P1
**Préconditions** : panier ≥ seuil du code, code `WELCOME10` actif.
**Étapes** : panier → saisir code → vérifier réduction appliquée → finaliser.
**Résultat attendu** : -10% visible sur récap et ligne dédiée en facture, montant CB débité correct.

---

### 🟢 CHECK-06 — Adresse de livraison ≠ adresse de facturation
**Priorité** : 🟠 P1
**Préconditions** : utilisateur connecté.
**Étapes** : adresse livraison ≠ facturation (case "autre adresse" cochée).
**Résultat attendu** : les deux adresses sont persistées séparément, factures à la bonne adresse.

---

### 🟢 CHECK-07 — Persistance du panier entre sessions
**Priorité** : 🟠 P1
**Préconditions** : guest ajoute 2 produits, ferme le navigateur.
**Étapes** : rouvrir le site 24h plus tard.
**Résultat attendu** : panier toujours présent (cookie/localStorage), prix et stock re-validés au checkout.

---

### 🟢 CHECK-08 — Fusion panier guest → utilisateur connecté
**Priorité** : 🟠 P1
**Préconditions** : panier guest (3 articles), compte existant avec panier vide.
**Étapes** : login depuis le panier → les 3 articles doivent rester.
**Résultat attendu** : panier fusionné, articles du compte prioritaire si doublons (incrément quantité).

---

### 🟢 CHECK-09 — Modification quantité / suppression depuis checkout
**Priorité** : 🟠 P1
**Préconditions** : panier avec 3 articles.
**Étapes** : étape panier → modifier qty, supprimer un article, ajouter un code promo, continuer.
**Résultat attendu** : totaux recalculés en temps réel, TVA correcte, frais livraison recalculés.

---

### 🟢 CHECK-10 — Checkout avec produit à variante (taille/couleur)
**Priorité** : 🟡 P2
**Préconditions** : produit avec variantes (T-shirt S, M, L).
**Étapes** : sélectionner taille M → ajouter → checkout → vérifier en récap.
**Résultat attendu** : SKU correct, stock décrémenté sur la bonne variante.

---

### 🟢 CHECK-11 — Achat multi-vendeurs avec frais de port groupés
**Priorité** : 🟡 P2
**Préconditions** : panier avec produits de 2 vendeurs.
**Étapes** : checkout → vérifier que les frais de port sont calculés par vendeur ET groupés.
**Résultat attendu** : 2 lignes de frais, total cohérent.

---

### 🟢 CHECK-12 — Reprise après refresh (F5) en cours de checkout
**Priorité** : 🟡 P2
**Préconditions** : utilisateur à l'étape paiement.
**Étapes** : F5 sur la page → vérifier retour à l'étape ou conservation d'état.
**Résultat attendu** : l'état du checkout est restauré (adresse, mode), pas de double commande.

---
## ❌ Scénarios d'erreur & cas limites

### 🔴 CHECK-E01 — Carte bancaire refusée
**Priorité** : 🔴 P0
**Étapes** : utiliser `4000 0000 0000 0002` (Stripe declined).
**Résultat attendu** : message d'erreur clair côté client (pas de confirmation), aucune commande créée, aucun stock décrémenté, possibilité de réessayer.

---

### 🔴 CHECK-E02 — 3D Secure requis (challenge)
**Priorité** : 🟠 P1
**Étapes** : carte `4000 0027 6000 3184` → pop-up 3DS → compléter le challenge.
**Résultat attendu** : commande finalisée après succès, échec si challenge abandonné.

---

### 🔴 CHECK-E03 — Timeout réseau pendant paiement
**Priorité** : 🔴 P0
**Étapes** : simuler perte réseau (DevTools offline) au moment du submit paiement.
**Résultat attendu** : message "réessayez", idempotence : pas de double débit en retentant, état commande cohérent côté backend.

---

### 🔴 CHECK-E04 — Stock épuisé entre ajout panier et paiement
**Priorité** : 🔴 P0
**Préconditions** : produit ajouté au panier, stock = 1.
**Étapes** : en parallèle (autre session/admin), passer le stock à 0 → valider le checkout.
**Résultat attendu** : message clair "stock épuisé", ligne surlignée, suppression proposée, aucun débit.

---

### 🔴 CHECK-E05 — Prix modifié entre ajout panier et paiement
**Priorité** : 🟠 P1
**Étapes** : admin modifie le prix après ajout panier → finaliser.
**Résultat attendu** : prix affiché est le prix courant, notification visible si différent du prix ajouté au panier, validation utilisateur.

---

### 🟠 CHECK-E06 — Email guest déjà utilisé (compte existant)
**Priorité** : 🟠 P1
**Étapes** : guest checkout avec email d'un compte existant.
**Résultat attendu** : suggestion de login OU création de commande guest sans collision, pas de doublon de compte.

---

### 🟠 CHECK-E07 — Adresse invalide (code postal, pays)
**Priorité** : 🟠 P1
**Étapes** : saisir CP `00000`, pays vide, caractères spéciaux.
**Résultat attendu** : erreurs de validation inline, focus sur le champ, soumission bloquée.

---

### 🟠 CHECK-E08 — Quantité > stock disponible
**Priorité** : 🟠 P1
**Étapes** : produit avec stock = 3, saisir quantité 5.
**Résultat attendu** : max forcé à 3, message clair.

---

### 🟠 CHECK-E09 — Code promo expiré / invalide / usage max atteint
**Priorité** : 🟠 P1
**Étapes** : tester codes `EXPIRED`, `FAKE10`, code usage unique déjà consommé.
**Résultat attendu** : message d'erreur dédié, pas de réduction appliquée.

---

### 🟠 CHECK-E10 — Code promo + produit hors promo
**Priorité** : 🟠 P1
**Étapes** : panier avec produits exclus du code.
**Résultat attendu** : code refusé OU application uniquement sur produits éligibles (selon règle métier, à confirmer PM).

---

### 🟡 CHECK-E11 — Caractères spéciaux dans les champs
**Priorité** : 🟡 P2
**Étapes** : nom `O'Brien`, adresse `Rue d'Étretat`, émojis, accents.
**Résultat attendu** : acceptés, correctement persistés et affichés, pas d'injection XSS.

---

### 🟡 CHECK-E12 — Tentative d'injection SQL / XSS dans les champs
**Priorité** : 🔴 Sécu
**Étapes** : saisir `' OR 1=1--`, `<script>alert(1)</script>`.
**Résultat attendu** : sanitisation, aucun impact (alerte, dump SQL, etc.).

---

### 🟡 CHECK-E13 — Montants limites (panier 0€, panier > plafond CB)
**Priorité** : 🟡 P2
**Étapes** : panier 0€ (article 100% promo), panier à 1 000 000€.
**Résultat attendu** : gestion correcte (panier 0€ = pas de checkout ou produit gratuit, plafond CB = message).

---

### 🟡 CHECK-E14 — Devise / pays incohérents
**Priorité** : 🟡 P2
**Étapes** : changer le pays en cours de checkout (FR → US).
**Résultat attendu** : devise et frais de port recalculés, message si mode de paiement indisponible dans le pays.

---

### 🟡 CHECK-E15 — Concurrence : double soumission checkout
**Priorité** : 🟠 P1
**Étapes** : double-cliquer sur "Payer", ou simuler 2 onglets.
**Résultat attendu** : idempotence : 1 seule commande, 1 seul débit.

---

### 🟡 CHECK-E16 — Back navigateur après paiement validé
**Priorité** : 🟡 P2
**Étapes** : sur la page confirmation, cliquer Retour.
**Résultat attendu** : retour à l'accueil (pas re-soumission), pas de double commande.

---

### 🟡 CHECK-E17 — Session expirée pendant checkout
**Priorité** : 🟠 P1
**Étapes** : attendre expiration token (ou forcer) pendant le tunnel.
**Résultat attendu** : redirection login avec reprise d'état, ou reconnexion transparente.

---

### 🟡 CHECK-E18 — Webhook Stripe dupliqué / en retard
**Priorité** : 🔴 P0
**Étapes** : rejouer le même webhook Stripe 3 fois.
**Résultat attendu** : idempotence (1 seule mise à jour), pas de double email, pas de double stock.

---

### 🟡 CHECK-E19 — Accessibilité clavier intégral
**Priorité** : 🔴 A11y
**Étapes** : parcours complet au clavier (Tab, Shift+Tab, Enter, Esc).
**Résultat attendu** : tous les éléments atteignables, ordre logique, focus visible, modales piégées.

---

### 🟡 CHECK-E20 — Responsive mobile (iPhone, Android) bout en bout
**Priorité** : 🔴 Mobile
**Étapes** : parcours complet sur viewport 375×667 (iPhone SE) et 412×915 (Pixel 7).
**Résultat attendu** : aucun overflow, CTA cliquables (44×44 px min), formulaire utilisable.

---

## 📊 Récapitulatif de couverture

| Catégorie | Nombre | % |
|-----------|-------:|---:|
| Nominaux | 12 | 60% |
| Erreurs / Edge cases | 20 | 100% |
| **Total scénarios** | **32** | – |

### Couverture par priorité

| Priorité | Compte |
|----------|-------:|
| 🔴 P0 (bloquant) | 7 |
| 🟠 P1 (critique) | 11 |
| 🟡 P2 (important) | 14 |

### Couverture par type de risque

| Risque | Scénarios |
|--------|-----------|
| Paiement | CHECK-01..05, E01..E03, E18 |
| Stock / Prix | E04, E05, E08 |
| Promo | CHECK-05, E09, E10 |
| Données / persistance | CHECK-07, CHECK-08, E11, E12, E17 |
| Concurrence | E15, E18 |
| UX / Navigation | CHECK-12, E16 |
| A11y / Mobile | E19, E20 |

---

## 🧪 Matrice d'exécution E2E (Playwright)

Chaque scénario P0 et P1 doit être implémenté en **e2e Playwright** avec cette matrice :

| Scénario | Chrome | Firefox | Safari | Mobile iOS | Mobile Android |
|----------|:------:|:-------:|:------:|:----------:|:--------------:|
| CHECK-01 | ✅ | ✅ | ✅ | ✅ | ✅ |
| CHECK-02 | ✅ | ✅ | ✅ | ✅ | ✅ |
| CHECK-03 | ✅ | ⚠️ | – | – | – |
| CHECK-04 | ✅ | – | ✅ (Apple) | ✅ | ✅ (Google) |
| CHECK-05 | ✅ | ✅ | ✅ | ✅ | ✅ |
| CHECK-08 | ✅ | ✅ | ✅ | ✅ | ✅ |
| E01, E03, E04 | ✅ | ✅ | ✅ | ✅ | ✅ |
| E18 (webhook) | – | – | – | – | – (test API) |

---

*Document maintenu par le QA Engineer. À exécuter en intégralité avant chaque release touchant au checkout.*
