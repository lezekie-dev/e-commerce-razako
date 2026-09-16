# PRD — Atelier | Plateforme e-commerce design premium

> Version 0.2 — patchs PM intégrés : §2.5 persona Margaux (acheteuse cadeau), §9 Stratégie de marque, scope étendu (US-16/17/18), KPIs ajustés.

---

## 1. Contexte

Atelier est une plateforme e-commerce dédiée à un catalogue d'objets design premium (mobilier, accessoires, luminaire, art de vivre). Le marché est saturé de templates génériques ; la marque se distingue par une identité visuelle forte, une curation éditoriale exigeante et une expérience d'achat sobre et tactile. Le lancement cible une audience urbaine 28-40 ans, sensible au design, à la qualité matérielle et au récit de marque, avec un panier moyen visé à 80 €.

---

## 2. Persona principal — Camille

**Camille — 32 ans, urbaine, design-conscious**
- **Profil** : Designer / archi / créative salariée en ville (Paris, Lyon, Bordeaux, Bruxelles). Revenu median+. Vit en couple ou colocation. Achète pour elle et son intérieur, et en cadeau (mariage, crémaillère).
- **Comportements** : Découvre des marques via Instagram, newsletters curatées, blogs design. Lit les specs (matériaux, dimensions, provenance) avant d'acheter. Décline si la fiche produit est pauvre ou le site "template Shopify".
- **Pain points** : Manque de curation, descriptions fades, photos uniformes, tunnel d'achat lourd, SAV opaque.
- **Job-to-be-done** : *"Quand j'achète un objet design, je veux comprendre la pièce, le maker et la matière en 30 secondes, pour être sûre de mon choix et fière de l'exposer."*
- **Critères de décision** : Qualité des photos > prix > récit > délai de livraison > retours.

---

## 2.5 Persona secondaire — Margaux acheteuse-cadeau

**Margaux — 36 ans, cadre marketing, Paris 11e, en couple depuis 5 ans.**
- **Profil** : réseau social dense (15-20 anniversaires/an à honorer), urbain CSP+, achète pour offrir quasi exclusivement.
- **Volume** : 8 à 12 cadeaux/an, dont 2-3 coups de cœur spontanés hors calendrier.
- **Occasions prioritaires** : Noël (peak), anniversaires adultes, crémaillère, Saint-Valentin, naissance, mariage, départ en retraite, fêtes des mères/pères.
- **Panier moyen estimé** : **110 €** (vs 80 € Camille) — budget cadeau plus généreux + option emballage (+8 €) + panier qui monte pour beaux-parents / couple.
- **Sizing** : ≈ **30-40 % du CA total** en MVP (raisonnement : panier ×1,37, fréquence ×1,5, base acheteuse-cadeau 30-40 % de la base Camille → pondéré ≈ 35 %, cohérent avec benchmarks e-commerce design premium FR).
- **Pain points spécifiques** :
  - Choix sans connaître les goûts du destinataire → indexation par **occasion** + **tranche de prix**
  - **Emballage cadeau premium** non négociable (le destinataire doit sentir « un vrai cadeau »)
  - **Message personnalisé** (carte, max 200 caractères)
  - **Livraison à adresse tierce** (≠ facturation) quasi systématique
  - **Discrétion sur le prix** : pas de montant visible sur le bon de livraison
  - **Retour facile** : si le destinataire n'aime pas, remboursement sans friction côté acheteur
- **User stories dédiées** : US-16 (filtre occasion), US-17 (emballage + message), US-18 (livraison tierce + discrétion BL).

---

## 3. Scope MVP

- Catalogue : catégories / sous-catégories / tags éditoriaux + **taxonomie occasion** (segment cadeau)
- Fiche produit riche : galerie HD, zoom, variantes (taille/couleur/matière), stock visible, specs techniques, story maker
- Recherche + filtres (catégorie, prix, marque, couleur, matière, note)
- **Filtre « Cadeau » par occasion + tranche de prix + profil destinataire** (US-16)
- Panier persistant (local + compte)
- Tunnel checkout 3 étapes : adresse → livraison → paiement (Stripe)
- **Option emballage cadeau + message personnalisé** au checkout (US-17)
- **Livraison à adresse tierce ≠ facturation + date livraison souhaitée + discrétion BL** (US-18)
- Auth : email/password + Google OAuth + reset password
- Espace client : commandes, wishlist, adresses, profil
- Avis & notes produits (1-5 + commentaire + photos)
- Wishlist persistée
- Codes promo (pourcentage, fixe, date d'expiration, limite d'usage)
- Admin dashboard : produits, commandes, clients, stats basiques
- Gestion stock & inventaire (alertes seuil bas)
- Emails transactionnels (confirmation commande, expédition, livraison) — **incluant templates « emballage cadeau » et « votre cadeau est en route »**
- Pages légales (CGV, CGU, mentions, RGPD, cookies)
- SEO on-page : meta, sitemap.xml, schema.org Product, Open Graph
- Responsive mobile-first
- Analytics (Plausible ou GA4) + tracking conversions
- Pages éditoriales (Accueil, À propos, Concept) — wireframes seulement en MVP

---

## 4. Out of scope (post-MVP)

- Multi-langue FR/EN/DE complet (structure i18n prête, trads en V1.1)
- Marketplaces tierces (Amazon, Etsy)
- Live shopping / vidéo produit
- Programme fidélité / points
- Recommandations IA personnalisées
- Abonnements / récurrent
- App mobile native
- Dropshipping / fulfillment multi-entrepôts
- Multi-magasins / multi-vendeurs marketplace

---

## 5. Critères de succès (KPIs chiffrés)

| KPI | Cible MVP (3 mois post-lancement) |
|---|---|
| Visits / mois | 10 000 sessions qualifiées |
| Taux de conversion | ≥ 1,8 % |
| **Panier moyen global** | **≥ 80 € (Camille) ; ≥ 110 € (Margaux achat-cadeau)** |
| **Part CA segment cadeau (Margaux)** | **≥ 30 %** (cible 35 %) |
| Abandon panier | ≤ 65 % |
| Délai première commande → livraison | ≤ 5 jours ouvrés |
| NPS post-achat | ≥ 50 |
| LCP (Largest Contentful Paint) | ≤ 2,0 s p75 mobile |
| CLS | ≤ 0,1 |
| INP | ≤ 200 ms |
| Lighthouse Score (mobile) | ≥ 90 sur toutes les catégories |
| Taux de retour | ≤ 6 % |
| Taux de réachat à 90 jours | ≥ 18 % |

---

## 6. Contraintes

**Performance**
- Core Web Vitals verts en p75 mobile (3G simulé)
- Images : AVIF/WebP, lazy-load, srcset responsive
- JS bundle initial < 180 KB gzip
- SSR ou SSG des pages publiques ; ISR pour catalogue

**Accessibilité (WCAG 2.2 AA)**
- Contraste texte ≥ 4,5:1
- Navigation clavier complète, focus visible
- ARIA sur composants custom (modales, combobox, tabs)
- Tests screen reader (VoiceOver, NVDA) sur flows critiques

**RGPD**
- Consentement cookies granulaire (analytics opt-in)
- Droit à l'effacement / export données (self-service compte + DPO)
- Hébergement UE (Neon eu-west-3 Paris, Vercel edge EU)
- Clauses RGPD dans tous les sous-traitants (Stripe, transporteurs, email)
- Logs d'accès données personnelles (audit trail)

**Stack cible (acté en ARCHITECTURE.md / TECH_STACK.md, alignement PRD)**
- Front : **Next.js 14 (App Router) + TypeScript strict + Tailwind + design system maison (cva, 0 kit UI)**
- Back : **Hono 4** sur Vercel Functions (`apps/api/api/[...route].ts`)
- DB : **PostgreSQL 16 via Drizzle 0.31** (Neon, eu-west-3)
- Paiement : **Stripe** (`PAYMENTS_MODE=mock` en dev, clé test en staging, clé live en prod)
- Cache / rate-limit : **Upstash Redis**
- Stockage images : **Cloudflare R2** (egress 0)
- Auth : **Auth.js v5** web ↔ JWT vérifié API (`jose`)
- Email : **Resend + React Email**
- Tests : **Vitest + Playwright + Testcontainers**

---

## 7. Risques & hypothèses à valider

| Risque | Hypothèse | Action |
|---|---|---|
| Le design se distingue-t-il vraiment ? | Identité visuelle posée avant dev (cf. §9) | Sprint 0 dédié infra/DS avant sprint 1 |
| Catalogue fournisseur réel ? | 30-50 SKU MVP disponibles | Curation sourcing avec fondateur avant sprint 2 |
| Paiement Stripe en prod ? | Compte Stripe OK, KYC passé | Vérifier en parallèle du sprint 0 |
| Délai photos HD ? | Studio photo interne | Briefer studio, livrer 50 SKU en J-15 |
| Volumétrie cadeau sous-estimée ? | 30-40 % du CA pourrait justifier sprint dédié V1.1 | Discovery post-lancement avec données réelles |

---

## 8. Décisions ouvertes

1. **Nom de marque définitif** : "Atelier" est provisoire — valider ou changer (proposition PM : "Maison 14").
2. **Couleur accent** : terracotta (#C04A2A) en placeholder dans `globals.css` — à confirmer ou changer.
3. **Hébergement images** : Cloudflare R2 (egress 0, choisi) vs Vercel Blob — acté R2.
4. **CMS éditorial** : MDX in-repo pour MVP (gratuit), Sanity en V1.1 si besoin éditorial riche.
5. **Carrier shipping** : Colissimo par défaut, Boxtal multi-transporteurs en V1.1.
6. **Taxonomie occasion** : 8 valeurs figées (Noël, anniversaire, crémaillère, Saint-Valentin, naissance, mariage, retraite, fêtes) ou éditorial libre ?

---

## 9. Stratégie de marque

### Manifeste (3 phrases)

1. **[NOM DE MARQUE]** sélectionne des objets et pièces de design pour leur exigence esthétique, leur matière honnête et leur capacité à traverser les modes.
2. Nous ne vendons pas du neuf-jetable : chaque pièce raconte un geste, un savoir-faire, une intention — et nous assumons de le faire savoir.
3. Offrir ou s'offrir [NOM DE MARQUE], c'est choisir la durée plutôt que l'effet, le sens plutôt que le statut.

> `[NOM DE MARQUE]` est un placeholder — à substituer dès que B-01 (nom de marque) est tranché.

### Tone of voice (5 bullets)

- **Sobre, jamais précieux** : on décrit un objet comme un adulte en parlerait à un autre adulte — pas de superlatifs vides, pas de « sublime » ni de « coup de cœur ».
- **Factuel avant poétique** : dimensions, matière, origine du maker, délai — puis le récit. L'info utile d'abord, l'émotion ensuite.
- **Présent affirmatif** : on évite le conditionnel marketing (« ce produit pourrait vous plaire »). On dit ce qu'il est, ce qu'il fait, pourquoi il existe.
- **Inclusif sans être familier** : vouvoiement par défaut, tutoiement uniquement sur les emails très ciblés (post-achat J+30). Jamais de tutoiement sur le site.
- **Honnête sur les limites** : si une pièce a une irrégularité de matière (céramique, bois), on le dit. La perfection industrielle n'est pas notre registre.

### Territoire visuel (5 bullets)

- **Palette** : tons minérales (craie, argile, sable, graphite) + 1 couleur d'accent à arbitrer (B-02 — candidats : terracotta profond, bleu cobalt, vert mousse). Jamais de noir pur ni de blanc clinique.
- **Typographie** : serif contemporain pour les titres (Garamond / Cardo / Söhne Mono esprit) + sans-serif humaniste pour le corps (Inter, Söhne). Gros contraste de tailles, corps généreux (16 px min desktop, 17 px mobile).
- **Photographie** : lumière naturelle, fond mat texturé (papier, lin, béton ciré), pas de fonds blancs e-commerce. Le produit est toujours mis en scène avec 1 élément de contexte (1 livre, 1 plante, 1 main). Jamais de photo packshot industrielle seule.
- **Mise en page** : aération extrême, grilles asymétriques, marges larges (minimum 80 px desktop, 24 px mobile). Le vide est un choix esthétique, pas un manque.
- **Iconographie & pictos** : dessinés main ou ligne fine, jamais d'icônes Material/Feather génériques. Pas d'emoji. Pictos paiement/livraison aux standards du secteur pour la confiance (CB, Visa, Mastercard, PayPal, Stripe).

---

*Document maintenu par le Product Manager. Patchs validés par Chief, intégrés depuis la relecture post-Mission #1.*
