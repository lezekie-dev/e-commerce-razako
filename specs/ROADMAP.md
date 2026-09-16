# ROADMAP — Atelier | 4 phases

> Format Now / Next / Later étalé en **MVP → V1.1 → V1.2 → V2**.
> Hypothèse squad : 3 devs fullstack + 1 designer + 1 QA + 1 PM (partiel).
> Cadence : sprints 2 semaines.

---

## 🟢 MVP — Lancement boutique (~10-12 semaines, 5-6 sprints)

**Objectif** : Boutique opérationnelle, premier référencement SEO, premières ventes réelles.

1. **Catalogue & fiche produit** — Grille, fiche riche, variantes, stock, tags éditoriaux.
2. **Recherche + filtres** — Recherche full-text, filtres combinables, URL deep-linkable.
3. **Auth + espace client** — Inscription, login email + Google, reset, commandes, adresses, wishlist.
4. **Panier + checkout Stripe** — Panier persistant, tunnel 3 étapes, paiement, confirmation.
5. **Admin core** — Gestion produits, gestion commandes, stats basiques (CA, nb commandes).
6. **Fondations SEO + RGPD + emails** — Meta, sitemap, schema.org Product, pages légales, cookies opt-in, emails transactionnels.

**Livrables** : site en prod, 30-50 SKU, 1 collection éditoriale de lancement.

---

## 🔵 V1.1 — Growth & contenu (~6-8 semaines, 3-4 sprints)

**Objectif** : Augmenter le trafic organique et la conversion, déployer la couche éditoriale.

1. **Pages éditoriales** — Accueil éditoriale, À propos, Concept, Journal/Storytelling.
2. **CMS headless (Sanity ou MDX)** — Permettre à l'équipe contenu de publier sans dev.
3. **Multi-langue FR/EN** — i18n activé (structure prête dès MVP), traductions EN livrées.
4. **Programme de bienvenue** — Code promo auto 10 % à l'inscription, séquence email 3 mails.
5. **Avis améliorés** — Photos dans les avis, modération, tri par pertinence.
6. **Analytics & A/B testing** — Plausible ou GA4 + Posthog, funnel de conversion tracké, 1er A/B (CTA panier).

**Livrables** : 5 articles éditoriaux publiés, version EN live, dashboard analytics.

---

## 🟣 V1.2 — Opérations & logistique (~6-8 semaines, 3-4 sprints)

**Objectif** : Réduire le coût opérationnel, améliorer la satisfaction post-achat.

1. **Multi-transporteurs (Boxtal)** — Comparaison tarifs, choix à l'admin selon poids/destination.
2. **Gestion stock avancée** — Alertes seuil, réapprovisionnement, mouvements de stock, inventaire.
3. **Retours & SAV self-service** — Portail client pour initier un retour, génération étiquette, suivi.
4. **Wishlist partagée** — URL publique wishlist (cadeau), notifications baisse de prix.
5. **Packaging premium** — Email d'expédition avec photo du colis emballé + message.
6. **Dashboard admin v2** — KPIs avancés (cohortes, LTV, top produits, marge), export CSV.

**Livrables** : taux de retour ≤ 6 %, NPS ≥ 50.

---

## 🟠 V2 — Personnalisation & échelle (~8-12 semaines, 4-6 sprints)

**Objectif** : Différenciation forte, fidélité, scale technique.

1. **Recommandations IA** — "Vous aimerez aussi" basé sur navigation/achat (embeddings ou reco simple).
2. **Programme fidélité** — Points cumulés, paliers, avantages (accès avant-premières, livraison offerte).
3. **Live shopping / vidéo produit** — Sessions live Instagram + intégration boutique.
4. **Subscriptions / récurrent** — Box mensuelle ou réassort automatique sur best-sellers.
5. **App mobile (React Native ou PWA)** — PWA offline-first d'abord, app native si traction validée.
6. **Marketplace / multi-marques** — Ouvrir la plateforme à d'autres créateurs (commission %).

**Livrables** : 25 % du CA via reco, 15 % via abonnements, app mobile.

---

## Indicateurs de passage de phase

| Passage | Critère |
|---|---|
| MVP → V1.1 | Site en prod ≥ 1 mois, NPS > 40, premier A/B testé |
| V1.1 → V1.2 | 1 000 commandes cumulées, version EN live, analytics matures |
| V1.2 → V2 | Marge opérationnelle saine, équipe opérationnelle, trafic > 50k/mois |
