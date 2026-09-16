# USER STORIES — Atelier | MVP

> 18 stories MVP, format *En tant que / je veux / afin de*.
> Priorisation **MoSCoW** : 🔴 Must · 🟠 Should · 🟡 Could · ⚪ Won't (MVP).
> Estimations en **story points Fibonacci** (1, 2, 3, 5, 8, 13).
> Critères d'acceptation en **Given / When / Then**.

---

## 🔴 US-01 — Catalogue navigable

**En tant que** visiteur, **je veux** parcourir les produits par catégorie et sous-catégorie **afin de** découvrir le catalogue de façon structurée.

- **CA1** Given je suis sur la page d'accueil, When je clique sur une catégorie, Then je vois la grille produit filtrée avec sous-catégories en breadcrumb et tri par défaut "Nouveautés".
- **CA2** Given la grille affiche > 24 produits, When je scrolle, Then le lazy-load ajoute les produits suivants sans saut visuel.
- **CA3** Given je suis sur mobile, When j'ouvre le menu, Then la nav catégories s'affiche en plein écran avec accordéon.

**Estimation** : 5 pts · **Priorité** : Must

---

## 🔴 US-02 — Fiche produit riche

**En tant que** visiteur, **je veux** consulter une fiche détaillée avec galerie, variantes, stock et specs **afin de** décider en confiance.

- **CA1** Given j'ouvre une fiche produit, When la page charge, Then je vois : galerie HD (≥ 5 photos), titre, prix, variantes (taille/couleur/matière), stock, specs tabulaires, description, story maker, avis.
- **CA2** Given une variante est en rupture, When je la sélectionne, Then le bouton "Ajouter au panier" est désactivé avec un message "Réapprovisionnement prévu le JJ/MM".
- **CA3** Given je clique sur une miniature, When la galerie change, Then la photo principale swap avec transition < 200 ms et annonce ARIA.

**Estimation** : 8 pts · **Priorité** : Must

---

## 🔴 US-03 — Recherche & filtres

**En tant que** visiteur, **je veux** chercher un produit par mot-clé et filtrer par prix, marque, catégorie, couleur, note **afin de** trouver rapidement ce qui m'intéresse.

- **CA1** Given je tape dans la barre de recherche, When j'attends 300 ms, Then la liste de suggestions s'affiche (autocomplete) avec max 8 résultats et highlight du terme.
- **CA2** Given j'applique les filtres prix + couleur + note, When la liste se met à jour, Then l'URL reflète les filtres (deep-linkable) et le compteur de résultats est annoncé.
- **CA3** Given aucun résultat, When la recherche est vide, Then j'ai un message clair + 3 suggestions éditoriales.

**Estimation** : 8 pts · **Priorité** : Must

---

## 🔴 US-04 — Panier persistant

**En tant que** visiteur, **je veux** ajouter un produit au panier et le retrouver plus tard **afin de** finaliser quand je veux.

- **CA1** Given je clique "Ajouter au panier", When l'action réussit, Then un drawer s'ouvre avec preview du panier et badge compteur mis à jour.
- **CA2** Given j'ai un panier non vide, When je ferme et rouvre le navigateur, Then mon panier est restauré (cookie + DB si loggué).
- **CA3** Given je modifie une quantité, When elle dépasse le stock, Then une erreur inline s'affiche avec message.

**Estimation** : 5 pts · **Priorité** : Must

---

## 🔴 US-05 — Tunnel checkout 3 étapes

**En tant qu'** acheteur, **je veux** payer en 3 étapes simples (adresse, livraison, paiement) **afin de** finaliser sans friction.

- **CA1** Given je valide mon panier, When j'arrive sur le checkout, Then je vois un stepper visuel (1/3, 2/3, 3/3) et peux revenir en arrière sans perte de données.
- **CA2** Given je saisis une adresse hors zone, When je valide, Then un message m'avertit que la livraison n'est pas possible.
- **CA3** Given le paiement est confirmé, When Stripe renvoie success, Then je suis redirigé vers une page confirmation + email envoyé.

**Estimation** : 13 pts · **Priorité** : Must

> **Patch PM (relecture)** : US-05 reste atomic "tunnel checkout 3 étapes" mais 13 pts ; à découper en sprint planning : US-05a stepper + adresse (5), US-05b livraison + paiement (8).

---

## 🔴 US-06 — Inscription / Login

**En tant que** visiteur, **je veux** créer un compte ou me connecter (email ou Google) **afin de** suivre mes commandes et ma wishlist.

- **CA1** Given je m'inscris, When je valide le formulaire, Then je reçois un email de confirmation (double opt-in) avant activation.
- **CA2** Given je clique "Continuer avec Google", When j'autorise OAuth, Then je suis connecté en < 3 s et redirigé vers la page d'origine.
- **CA3** Given je saisis un mot de passe faible, When je valide, Then un indicateur de force m'aide (zxcvbn) avec min 8 chars + 1 chiffre.

**Estimation** : 8 pts · **Priorité** : Must

---

## 🔴 US-07 — Reset password

**En tant qu'** utilisateur, **je veux** réinitialiser mon mot de passe oublié **afin de** récupérer l'accès à mon compte.

- **CA1** Given je clique "Mot de passe oublié", When je saisis mon email, Then je reçois un lien sécurisé (JWT, expiration 1 h) si l'email existe (sinon même réponse pour ne pas leaker).
- **CA2** Given je clique sur le lien, When il est valide, Then je saisis un nouveau MDP (avec confirmation) et suis reconnecté.

**Estimation** : 3 pts · **Priorité** : Must

---

## 🔴 US-08 — Espace client — Commandes

**En tant que** client connecté, **je veux** voir l'historique et le détail de mes commandes **afin de** suivre leur statut.

- **CA1** Given je suis dans mon espace, When j'ouvre "Mes commandes", Then je vois la liste paginée triée par date desc avec statut (payée, expédiée, livrée).
- **CA2** Given j'ouvre une commande, When la page charge, Then je vois les produits, le total, l'adresse, le n° de suivi (si expédiée).

**Estimation** : 5 pts · **Priorité** : Must

---

## 🔴 US-09 — Wishlist

**En tant que** visiteur ou client, **je veux** sauvegarder des produits en favoris **afin de** les retrouver plus tard.

- **CA1** Given je clique sur l'icône cœur d'une fiche, When l'action réussit, Then l'icône passe en état actif et une notification toast confirme.
- **CA2** Given je ne suis pas connecté, When j'ajoute > 3 favoris, Then on me propose la connexion pour synchroniser ma wishlist (sans perdre le local).

**Estimation** : 3 pts · **Priorité** : Must

---

## 🔴 US-10 — Avis & notations

**En tant que** client ayant acheté, **je veux** laisser un avis (note + texte + photos) **afin de** partager mon expérience.

- **CA1** Given j'ai reçu ma commande, When j'ouvre la fiche produit, Then le CTA "Donner mon avis" est disponible et pré-rempli avec le produit.
- **CA2** Given je publie un avis, When il est validé, Then il s'affiche avec note moyenne mise à jour et badge "Avis vérifié".

**Estimation** : 5 pts · **Priorité** : Must

---

## 🔴 US-11 — Codes promo

**En tant qu'** acheteur, **je veux** saisir un code promo au checkout **afin de** bénéficier d'une réduction.

- **CA1** Given je saisis "ATELIER10", When le code est valide, Then la réduction s'applique en ligne et le total est mis à jour avec détail.
- **CA2** Given le code est expiré ou à usage unique déjà consommé, When je valide, Then un message d'erreur clair s'affiche.

**Estimation** : 3 pts · **Priorité** : Must

---

## 🔴 US-12 — Admin — Gestion produits

**En tant qu'** admin, **je veux** créer, éditer, supprimer des produits (avec variantes, stock, photos) **afin de** gérer le catalogue.

- **CA1** Given je suis dans l'admin, When j'ajoute un produit, Then je remplis un formulaire multi-step (infos → photos → variantes → SEO) avec preview live.
- **CA2** Given j'upload une photo, When elle est traitée, Then une version AVIF + WebP + thumbnail sont générées automatiquement.

**Estimation** : 13 pts · **Priorité** : Must

> **Patch PM (relecture)** : US-12 à splitter en sprint planning : US-12a CRUD produits + variantes (5), US-12b upload + pipeline images (8). Sinon trop gros à tester.

---

## 🔴 US-13 — Admin — Gestion commandes

**En tant qu'** admin, **je veux** voir et traiter les commandes (statut, remboursement, étiquette) **afin de** gérer l'opérationnel.

- **CA1** Given une commande est payée, When je change son statut à "expédiée" + ajoute un n° de suivi, Then un email automatique part au client.

**Estimation** : 8 pts · **Priorité** : Must

---

## 🟠 US-14 — Emails transactionnels

**En tant que** client, **je veux** recevoir des emails clairs à chaque étape (commande, expédition, livraison) **afin de** être informé.

- **CA1** Given ma commande est confirmée, When Stripe valide le paiement, Then je reçois un email "Commande confirmée" avec récap et délai estimé.
- **CA2** Given ma commande est livrée, When le statut passe à "livrée", Then je reçois un email de confirmation avec lien vers avis.

**Estimation** : 5 pts · **Priorité** : Should (MVP requis)

---

## 🟠 US-15 — Pages légales & RGPD

**En tant que** visiteur, **je veux** accéder aux CGV, CGU, mentions, RGPD, cookies **afin de** comprendre mes droits et obligations.

- **CA1** Given je visite le footer, When je clique sur "CGV" / "RGPD" / "Mentions légales", Then la page correspondante s'ouvre avec contenu juridique validé par avocat.
- **CA2** Given j'arrive sur le site, When le bandeau cookies s'affiche, Then je peux accepter tout, refuser tout, ou granulariser (analytics on/off).

**Estimation** : 3 pts · **Priorité** : Should (MVP requis)

---

## 🔴 US-16 — Recherche par occasion (filtre « Cadeau »)

**En tant qu'** acheteuse-cadeau (Margaux),
**je veux** filtrer le catalogue par occasion (Noël, anniversaire, crémaillère, Saint-Valentin, naissance, mariage, départ retraite, fêtes) + tranche de prix + profil destinataire (f/h/couple/enfant)
**afin de** trouver un cadeau pertinent en moins de 3 minutes sans connaître les goûts intimes du destinataire.

- **CA1** Given je suis sur la home ou le catalogue, When je clique sur le filtre « Cadeau » dans la nav principale, Then un drawer s'ouvre avec : sélecteur d'occasion (8 chips), tranche de prix (4 paliers : <50, 50-100, 100-200, 200+), profil destinataire (4 chips), et la grille se filtre sans reload avec animation < 300 ms.
- **CA2** Given j'ai appliqué au moins un filtre, When l'URL change, Then l'état des filtres est deep-linkable (query params `?occasion=noel&prix=50-100&destinataire=f`) et partageable (ouvre la même vue filtrée sur un autre device).
- **CA3** Given aucun résultat ne matche mes filtres, When la grille s'affiche, Then je vois un état vide friendly (« Aucun cadeau ne matche — élargir le prix ? changer d'occasion ? ») avec 2 CTAs d'élargissement.

**Estimation** : 8 pts · **Priorité** : Must (segment ≈ 35 % CA cible)

---

## 🔴 US-17 — Option emballage cadeau + message personnalisé

**En tant qu'** acheteuse-cadeau,
**je veux** ajouter une option « emballage cadeau premium » au checkout avec un message personnalisé (carte, max 200 caractères) et le choix du papier (kraft / noir mat / saisonnier)
**afin de** livrer un objet qui se présente comme un vrai cadeau, sans manipulation de ma part.

- **CA1** Given je suis à l'étape « Livraison » du checkout, When la case « Emballage cadeau » apparaît sous le récap panier, Then la cocher active 3 sous-options : choix du papier (3 visuels cliquables), zone de message (textarea 200 char avec compteur), +8 € ajoutés au total en temps réel.
- **CA2** Given j'ai saisi un message, When je dépasse 200 caractères, Then le compteur passe en rouge et la saisie est bloquée ; le message est prévisualisé en petit encart « Aperçu carte » à côté.
- **CA3** Given j'ai validé ma commande avec emballage cadeau, When la confirmation de commande s'affiche, Then le récap mentionne explicitement « Emballage cadeau — papier X — message : "…" » et cet ajout est reporté dans l'email de confirmation + dans l'admin commande (badge + lecture du message).

**Estimation** : 8 pts · **Priorité** : Must (option +8 €, fort impact panier moyen)

---

## 🔴 US-18 — Livraison à une adresse tierce (≠ facturation)

**En tant qu'** acheteuse-cadeau,
**je veux** saisir une adresse de livraison différente de mon adresse de facturation au checkout, avec date de livraison souhaitée (J+2 à J+7)
**afin de** faire livrer le colis directement chez le destinataire sans intermédiaire ni passage chez moi.

- **CA1** Given je suis à l'étape « Adresse » du checkout, When la case « C'est un cadeau — livrer à une autre adresse » est cochée, Then un second formulaire d'adresse apparaît (sans impact sur l'adresse de facturation), avec validation autocomplete adresse FR (API BAN) et distinction visuelle claire « Adresse de facturation » vs « Adresse de livraison ».
- **CA2** Given j'ai saisi une adresse tierce, When je passe à l'étape « Livraison », Then les modes de livraison affichent les délais estimés à cette adresse précise (J+2 colissimo / J+3 point relais / J+5 express) + tarif, et je peux choisir une date de livraison souhaitée (calendrier, jours ouvrés uniquement, J+2 à J+7).
- **CA3** Given la commande est confirmée avec adresse tierce, When le colis est expédié, Then le bon de livraison dans le colis ne mentionne ni le prix ni le détail des articles (uniquement « Cadeau — Atelier » + référence), et l'email de confirmation m'est envoyé à moi (acheteur) tandis qu'un email « votre cadeau est en route » est envoyé au destinataire si j'ai renseigné son email (optionnel).

**Estimation** : 13 pts · **Priorité** : Must · **Recommandation** : split en 2 — US-18a split adresse (5) + US-18b date livraison + discrétion BL (8).

---

## Récap effort MVP

| Must | 18 stories | ≈ 124 pts |
| Should (MVP) | 2 stories | ≈ 8 pts |
| **Total MVP** | **20 stories** | **≈ 132 pts** |

> Capacité squad type (3 devs + 1 design + 1 QA) ≈ 30 pts/sprint → MVP livrable en ~5-6 sprints (15-18 semaines). PM recommande **sprint 0 infra/DS** dédié + 6-7 sprints (cf. ROADMAP.md).
