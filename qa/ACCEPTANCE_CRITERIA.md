# ✅ Critères d'Acceptation — Plateforme E-Commerce

> **Version** : 1.0
> **Auteur** : QA Engineer
> **Format** : Binaire (passe / ne passe pas) — Given/When/Then
> **Référence** : Plan de Test Global (`TEST_PLAN.md`)

> **Convention** : chaque critère est **binaire**. Pas de "généralement", pas de "plutôt". Une acceptance est **vérifiable** par un test automatisé ou un check manuel précis.

---

## 🔐 1. Login / Signup

### AC-AUTH-01 — Inscription email
**Given** un visiteur sur la page signup
**When** il saisit email valide + mot de passe conforme (≥ 8 caractères, 1 majuscule, 1 chiffre) et valide
**Then** un compte est créé, un email de confirmation est envoyé, l'utilisateur est redirigé vers l'accueil connecté.

### AC-AUTH-02 — Erreurs d'inscription
**Given** un visiteur sur la page signup
**When** il saisit email déjà utilisé OU mot de passe faible OU email mal formé
**Then** un message d'erreur clair s'affiche sous le champ concerné, la soumission est bloquée, aucun compte n'est créé.

### AC-AUTH-03 — Connexion
**Given** un utilisateur inscrit et confirmé
**When** il saisit email + mot de passe corrects
**Then** il est connecté, redirigé vers la page d'origine ou l'accueil, un token est stocké (httpOnly cookie).

### AC-AUTH-04 — Lockout après tentatives échouées
**Given** un compte existant
**When** 5 tentatives échouées sont effectuées en 10 minutes
**Then** le compte est temporairement verrouillé (15 min), un message clair est affiché, aucune fuite d'info (existence du compte).

### AC-AUTH-05 — Reset password
**Given** un utilisateur ayant oublié son mot de passe
**When** il saisit son email sur la page dédiée
**Then** un email avec lien signé (expiration 1h) est envoyé, et il peut définir un nouveau mot de passe via ce lien.

### AC-AUTH-06 — OAuth Google / Apple
**Given** un visiteur sur la page login
**When** il choisit Google ou Apple et valide la popup OAuth
**Then** un compte est créé si nouvel email OU il est connecté si email existant, sans mot de passe requis.

### AC-AUTH-07 — Logout
**Given** un utilisateur connecté
**When** il clique sur "Déconnexion"
**Then** sa session est détruite côté serveur, les cookies sont purgés, il est redirigé vers l'accueil en mode guest.

---

## 🔎 2. Recherche & Catalogue

### AC-SEARCH-01 — Recherche simple
**Given** un visiteur sur la homepage
**When** il saisit un terme dans la barre de recherche et valide
**Then** les résultats pertinents s'affichent sous 1s (p75), avec image, titre, prix et note.

### AC-SEARCH-02 — Recherche vide
**Given** un visiteur sur la recherche
**When** il saisit une chaîne qui ne match aucun produit
**Then** un message "Aucun résultat" est affiché + suggestions de catégories populaires.

### AC-SEARCH-03 — Filtres
**Given** une page de résultats
**When** l'utilisateur applique des filtres (taille, couleur, prix, marque, disponibilité)
**Then** les résultats sont mis à jour sans rechargement (ou via URL partageable), le compteur de résultats est exact.

### AC-SEARCH-04 — Tri
**Given** une page de résultats
**When** l'utilisateur choisit un tri (pertinence, prix ↑↓, nouveautés, meilleures ventes)
**Then** l'ordre des résultats change, le tri est persisté dans l'URL, l'état est partageable.

### AC-SEARCH-05 — Pagination
**Given** plus de 24 résultats
**When** l'utilisateur navigue en page 2/3/...
**Then** les résultats suivants s'affichent, l'URL reflète la page, "page précédente" est désactivée en page 1.

### AC-SEARCH-06 — Performance
**Given** un utilisateur sur la recherche
**When** il saisit un terme
**Then** les résultats apparaissent en moins de 1.5s (p75) sur 3G Fast, et moins de 800ms en Wi-Fi.

---

## 📦 3. Fiche Produit

### AC-PROD-01 — Affichage fiche
**Given** un produit existant
**When** l'utilisateur accède à `/product/:slug`
**Then** il voit : nom, prix, galerie d'images, variantes, description, stock dispo, avis, CTA "Ajouter au panier".

### AC-PROD-02 — Sélection de variante
**Given** un produit avec tailles
**When** l'utilisateur sélectionne une taille
**Then** le stock affiché correspond à cette variante, le CTA est actif uniquement si stock > 0.

### AC-PROD-03 — Ajout au panier
**Given** un produit en stock
**When** l'utilisateur clique "Ajouter au panier"
**Then** une notification de confirmation s'affiche, le compteur du panier est incrémenté, le produit est ajouté (visible dans le panier).

### AC-PROD-04 — Quantité max
**Given** un produit avec stock = 3
**When** l'utilisateur essaie d'ajouter plus de 3
**Then** la quantité est plafonnée à 3 et un message clair est affiché.

### AC-PROD-05 — Galerie
**Given** un produit avec plusieurs images
**When** l'utilisateur clique sur une vignette
**Then** l'image principale change, la navigation clavier (←/→) fonctionne.

### AC-PROD-06 — Zoom
**Given** un produit
**When** l'utilisateur survole ou clique l'image principale
**Then** un zoom s'ouvre (desktop) ou un swipe est possible (mobile), accessible au clavier.

---

## 🛒 4. Panier

### AC-CART-01 — Ajout depuis fiche produit
**Given** un produit en stock
**When** l'utilisateur clique "Ajouter au panier" depuis la fiche
**Then** le produit apparaît dans le panier, compteur mis à jour, notification visible.

### AC-CART-02 — Modification quantité
**Given** un produit dans le panier
**When** l'utilisateur modifie la quantité
**Then** le sous-total, total et frais de port sont recalculés en temps réel (debounce 300ms).

### AC-CART-03 — Suppression article
**Given** un produit dans le panier
**When** l'utilisateur clique "Supprimer"
**Then** l'article disparaît, le total est recalculé, si panier vide → message + suggestions.

### AC-CART-04 — Persistance
**Given** un panier rempli en mode guest
**When** l'utilisateur ferme le navigateur et revient 24h plus tard
**Then** le panier est toujours présent, avec prix et stock re-validés à l'affichage.

### AC-CART-05 — Fusion guest → login
**Given** un panier guest (3 articles) ET un compte existant avec panier (2 articles)
**When** l'utilisateur se connecte depuis le panier
**Then** les 5 articles sont présents, les doublons sont fusionnés (quantité additionnée), un récap clair est affiché.

### AC-CART-06 — Panier abandonné (email)
**Given** un panier rempli non converti après 30 minutes
**When** le système de relance s'exécute
**Then** un email de rappel est envoyé (avec lien vers panier), max 2 emails sur 7 jours.

---

## 💳 5. Checkout (Tunnel d'achat)

> Référence complète : `SCENARIOS_CHECKOUT.md`. Les acceptance ci-dessous sont les **gating criteria** (bloquant go/no-go).

### AC-CHECKOUT-01 — Étapes visibles
**Given** un utilisateur à l'étape 1/5 du tunnel
**When** il consulte la page
**Then** une stepper (1→5) est visible avec l'étape courante en évidence, les étapes complétées cochées.

### AC-CHECKOUT-02 — Validation à chaque étape
**Given** un utilisateur à une étape
**When** il clique "Continuer" avec des champs invalides
**Then** les erreurs sont affichées inline, le focus va sur le 1er champ en erreur, l'étape suivante ne s'ouvre pas.

### AC-CHECKOUT-03 — Récap toujours visible
**Given** un utilisateur en cours de checkout (étape 3+)
**When** il consulte la page
**Then** un récap (articles + total + frais de port) est visible en sidebar ou en haut, et reste à jour.

### AC-CHECKOUT-04 — Adresse valide
**Given** un utilisateur à l'étape adresse
**When** il saisit une adresse (CP, ville, pays, rue)
**Then** la validation API confirme la délivrabilité (Google Address Validator ou équivalent), et un message clair s'affiche si non desservi.

### AC-CHECKOUT-05 — Mode de livraison
**Given** une adresse valide
**When** les modes de livraison sont calculés
**Then** au moins 1 mode est proposé (délai + prix), l'utilisateur peut en choisir un, le prix est intégré au total.

### AC-CHECKOUT-06 — Idempotence paiement
**Given** un utilisateur qui clique 2 fois sur "Payer" (réseau lent ou double-clic)
**When** le backend reçoit les 2 requêtes
**Then** seule **1 commande** est créée, **1 seul débit** Stripe a lieu, l'idempotence-key est honorée.

### AC-CHECKOUT-07 — Webhook Stripe
**Given** un paiement Stripe réussi
**When** le webhook `payment_intent.succeeded` arrive
**Then** la commande passe en statut `paid`, le stock est décrémenté, l'email de confirmation est envoyé, et un rejouement du même webhook est sans effet.

### AC-CHECKOUT-08 — Page de confirmation
**Given** un paiement validé
**When** l'utilisateur est redirigé vers `/order/:id/confirmation`
**Then** il voit : numéro de commande, récap, estimation de livraison, email envoyé ; la page n'est pas re-soumissible par le back navigateur.

### AC-CHECKOUT-09 — Abandon & reprise
**Given** un utilisateur qui quitte le checkout (ferme l'onglet) après avoir saisi une adresse
**When** il revient dans les 7 jours via un email ou le lien "reprendre ma commande"
**Then** il retrouve son panier + adresse + mode de livraison, peut reprendre sans tout ressaisir.

### AC-CHECKOUT-10 — Mobile bout en bout
**Given** un utilisateur sur iPhone ou Android
**When** il complète le tunnel (CTA, formulaires, paiement)
**Then** aucun élément n'est coupé, les CTA sont ≥ 44×44 px, le formulaire est utilisable au clavier mobile, le wallet (Apple/Google Pay) s'affiche quand disponible.

### AC-CHECKOUT-11 — Accessibilité WCAG AA
**Given** tout parcours checkout
**When** un utilisateur navigue au clavier ou avec un lecteur d'écran (NVDA/VoiceOver)
**Then** tous les éléments sont atteignables et annoncés, le focus est visible, les formulaires ont des labels, les erreurs sont annoncées (aria-live).

---

## 💰 6. Paiement

### AC-PAY-01 — CB via Stripe Elements
**Given** un utilisateur à l'étape paiement
**When** il saisit un numéro de CB valide
**Then** le PAN est validé côté client (Luhn), les données sensibles ne quittent jamais notre serveur (PCI-DSS via iframe Stripe).

### AC-PAY-02 — 3D Secure
**Given** une carte nécessitant 3DS
**When** le challenge s'affiche
**Then** l'utilisateur peut le compléter, la commande ne se finalise qu'après succès ; abandon = message clair, aucun débit.

### AC-PAY-03 — PayPal
**Given** un utilisateur à l'étape paiement
**When** il choisit PayPal et complète sur la page PayPal
**Then** il revient sur la page de confirmation, le paiement est confirmé, l'ID transaction PayPal est stocké.

### AC-PAY-04 — Apple Pay / Google Pay
**Given** un navigateur compatible
**When** l'utilisateur choisit le wallet et s'authentifie (Touch ID / Face ID / biométrique)
**Then** le paiement est validé en 1 action, sans saisie de CB.

### AC-PAY-05 — Échec de paiement
**Given** une CB refusée (fonds insuffisants, CVC incorrect, etc.)
**When** la transaction échoue
**Then** un message clair s'affiche, la commande reste en `pending`, l'utilisateur peut réessayer avec une autre carte, aucun email de confirmation n'est envoyé.

### AC-PAY-06 — Remboursement
**Given** une commande payée
**When** l'admin lance un remboursement total ou partiel
**Then** le remboursement Stripe est créé, le stock est recréditré si configuré, l'email client est envoyé.

### AC-PAY-07 — Aucune donnée CB en log
**Given** toute transaction
**When** elle est loggée (backend, monitoring, analytics)
**Then** aucun PAN, CVC, date d'expiration n'apparaît dans les logs (vérifié par audit + SAST).

---

## 👤 7. Compte Client

### AC-ACCOUNT-01 — Historique commandes
**Given** un utilisateur connecté avec ≥ 1 commande
**When** il accède à `/account/orders`
**Then** il voit la liste paginée de ses commandes avec statut, date, total, lien vers détail.

### AC-ACCOUNT-02 — Détail commande
**Given** un utilisateur sur une commande
**When** il consulte le détail
**Then** il voit : récap, adresse, mode de livraison, statut, suivi (si expédié), facture PDF téléchargeable.

### AC-ACCOUNT-03 — Adresses sauvegardées
**Given** un utilisateur connecté
**When** il accède à `/account/addresses`
**Then** il voit ses adresses enregistrées, peut en ajouter/modifier/supprimer, et en définir une par défaut.

### AC-ACCOUNT-04 — Wishlist
**Given** un utilisateur connecté
**When** il ajoute un produit à sa wishlist depuis la fiche
**Then** le produit apparaît dans `/account/wishlist`, avec lien direct vers la fiche, et il peut le déplacer vers le panier.

### AC-ACCOUNT-05 — Modification profil
**Given** un utilisateur connecté
**When** il modifie nom, email ou mot de passe
**Then** les changements sont persistés, l'email est re-confirmé si l'email change, l'ancien mot de passe est requis pour changer le mot de passe.

### AC-ACCOUNT-06 — Suppression de compte (RGPD)
**Given** un utilisateur connecté
**When** il demande la suppression depuis les paramètres
**Then** un email de confirmation est envoyé, après validation le compte + données personnelles sont anonymisés dans 30 jours (délai légal), les commandes anonymisées restent pour la compta.

### AC-ACCOUNT-07 — Fidélité (si applicable V1)
**Given** un utilisateur passant une commande
**When** la commande est payée
**Then** des points sont crédités (ex : 1€ = 1 point), visibles dans son espace, avec une barre de progression vers la prochaine récompense.

---

## 🛠 8. Back-office Admin

### AC-ADMIN-01 — Auth admin
**Given** un utilisateur sans rôle admin
**When** il tente d'accéder à `/admin/*`
**Then** il reçoit 403/404, aucune fuite d'info sur l'existence de la route.

### AC-ADMIN-02 — Liste produits
**Given** un admin connecté
**When** il accède à `/admin/products`
**Then** il voit la liste paginée, peut filtrer/rechercher, créer/éditer/désactiver un produit.

### AC-ADMIN-03 — Édition produit
**Given** un produit existant
**When** l'admin modifie prix, stock, description, images
**Then** les changements sont persistés et reflétés immédiatement en storefront (cache invalidé).

### AC-ADMIN-04 — Gestion commandes
**Given** un admin
**When** il consulte `/admin/orders`
**Then** il voit toutes les commandes avec filtres (statut, date, client), peut marquer comme expédiée / remboursée.

### AC-ADMIN-05 — Gestion utilisateurs
**Given** un admin
**When** il consulte `/admin/users`
**Then** il voit la liste, peut désactiver/réactiver un compte, voir l'historique d'un client.

### AC-ADMIN-06 — Codes promo
**Given** un admin
**When** il crée un code promo (%, montant fixe, seuil, dates, usages max, produits éligibles)
**Then** le code fonctionne en storefront selon les règles définies, et le compteur d'usages est correct.

### AC-ADMIN-07 — Audit log
**Given** toute action admin sensible
**When** elle est exécutée
**Then** un log est enregistré (qui, quand, quoi, IP), consultable par les super-admin.

### AC-ADMIN-08 — Permissions fines (RBAC)
**Given** un admin avec rôle limité (ex : catalogue manager)
**When** il tente d'accéder à une ressource hors périmètre
**Then** l'accès est refusé, aucune action n'est possible.

---

## 📧 9. Emails Transactionnels (cross-cutting)

### AC-EMAIL-01 — Confirmation de commande
**Given** une commande payée
**When** le webhook Stripe confirme le paiement
**Then** un email est envoyé sous 30s, contenant : n° commande, récap, adresse, mode de livraison, estimation.

### AC-EMAIL-02 — Expédition
**Given** une commande marquée "expédiée" par l'admin
**When** le statut passe à `shipped`
**Then** un email avec numéro de suivi est envoyé au client.

### AC-EMAIL-03 — Panier abandonné
**Given** un panier non converti
**When** 30 min se sont écoulées
**Then** un email de rappel est envoyé (max 2/7 jours), avec un lien personnalisé.

### AC-EMAIL-04 — Délivrabilité
**Given** tout email transactionnel
**When** il est envoyé
**Then** SPF + DKIM + DMARC sont configurés, le score de délivrabilité est monitoré (≥ 99%).

---

## ⚡ 10. Non-fonctionnel (cross-cutting)

### AC-NFR-01 — Performance LCP
**Given** une page d'accueil, recherche, fiche produit ou checkout
**When** un utilisateur y accède (p75, 3G Fast)
**Then** le LCP est < 2.5s (vérifié par Lighthouse CI bloquant).

### AC-NFR-02 — Compatibilité cross-browser
**Given** tout parcours utilisateur
**When** il est testé sur Chrome, Firefox, Safari (3 dernières versions)
**Then** le parcours critique (recherche → panier → checkout → paiement → confirmation) passe sur les 3 navigateurs.

### AC-NFR-03 — Responsive mobile
**Given** un viewport mobile (375px, 414px)
**When** l'utilisateur navigue
**Then** aucun overflow horizontal, aucun texte tronqué, tous les CTA sont cliquables (≥ 44×44 px), le menu hamburger fonctionne.

### AC-NFR-04 — Accessibilité WCAG AA
**Given** toute page du parcours critique
**When** un scan axe-core est exécuté
**Then** 0 violation critique ou sérieuse, le contraste est ≥ 4.5:1 (texte) / 3:1 (UI), les images ont des alt, les formulaires ont des labels.

### AC-NFR-05 — Sécurité OWASP Top 10
**Given** l'application
**When** elle est scannée (OWASP ZAP + SAST + Snyk)
**Then** 0 vulnérabilité high/critical sur le Top 10 OWASP : injection, broken auth, sensitive data exposure, XXE, broken access control, misconfiguration, XSS, insecure deserialization, vulnerable components, insufficient logging.

### AC-NFR-06 — Disponibilité
**Given** l'API en charge nominale
**When** elle reçoit 500 RPS pendant 5 min
**Then** le taux d'erreur est < 0.1%, la latence p99 < 800ms (vérifié par k6 en staging).

### AC-NFR-07 — Logs & observabilité
**Given** toute erreur 5xx ou action critique (paiement, webhook)
**When** elle se produit
**Then** un log structuré (JSON) est émis avec correlation_id, l'alerte est envoyée à l'équipe si S1, et le parcours est traçable de bout en bout.

---

## 📊 Récapitulatif

| Feature | # Critères | Bloquants (P0) |
|---------|:----------:|:--------------:|
| Login / Signup | 7 | 4 |
| Recherche & Catalogue | 6 | 3 |
| Fiche Produit | 6 | 3 |
| Panier | 6 | 3 |
| Checkout | 11 | 7 |
| Paiement | 7 | 5 |
| Compte Client | 7 | 4 |
| Admin | 8 | 5 |
| Emails | 4 | 2 |
| Non-fonctionnel | 7 | 7 |
| **TOTAL** | **69** | **43** |

---

*Document maintenu par le QA Engineer. À valider avec PM (alignement métier) et Tech Lead (faisabilité) avant le sprint 1.*