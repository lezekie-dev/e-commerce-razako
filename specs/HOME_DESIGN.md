# SPEC DESIGN — HOME PAGE
**Path source** : `bots/cmu4blzig069k11s06cc45t17/specs/HOME_DESIGN.md`
**Cible build** : `apps/web/app/page.tsx` (Server Component) + `apps/web/components/home/*` (îlots client si besoin)
**Stack** : Next.js 14 App Router · TS strict · Tailwind · DS maison (cva, `packages/ui/src/tokens.ts`)
**Refs** : `PRD.md §9` · `USER_STORIES.md` US-01/03/04/16 · `qa/ACCEPTANCE_HOME.md` (15 AC) · `DECISIONS.md` D-11/D-15

---

## 0. Décision palette (B-02 — tranchée ici)

**Terracotta `#C04A2A` = `accent.700` → CONFIRMÉ**.
*Justification (1 phrase)* : registre argile/céramique cohérent avec la palette minérale §9 (craie, sable, graphite) + contraste WCAG AA **8.4:1** sur fond `surface` (`#FAFAFA`) → utilisable en texte, ring focus, CTA primary. Aucun changement de token requis, déjà câblé dans `tokens.ts`.

---

## 1. Layout — Desktop 1280 px

- Container `size="lg"` (max-w-7xl = 1280 px), padding-x **80 px** (PRD §9 marges min 80 px desktop).
- Grille principale : **12 colonnes** Tailwind (`grid-cols-12`), gutter **24 px** interne.
- Body font-size **16 px** (PRD §9 min desktop), line-height **1.6**.
- Flux vertical : `Header → Hero → Collections vedettes → Produits vedettes → Bandeau manifeste → Footer`.
- Breakpoints utilisés : `sm 640 · md 768 · lg 1024 · xl 1280`.

## 2. Layout — Mobile 390 px

- Container padding-x **24 px** (PRD §9 marges min 24 px mobile).
- Body font-size **17 px** (PRD §9 min mobile, plus aéré pour pouce).
- Grilles : **1 col** mobile (≤ 640), **2 col** tablette (≥ 768), **4 col** desktop (≥ 1024).
- Tap targets **≥ 44×44 px** (AC-HOME-10/11).
- Pas de scroll horizontal (`scrollWidth === viewport`).
- Nav principale **hamburger** derrière `button[aria-expanded]` (AC-HOME-10).

---

## 3. Hiérarchie typographique (serif titres + sans corps)

| Niveau | Famille | Taille desktop / mobile | Poids | Line-height | Tracking | Usage |
|---|---|---|---|---|---|---|
| **H1** | Playfair Display (`font-display`) | **56 / 36 px** | 500 | 1.1 | -0.02em | Hero titre |
| **H2** | Playfair Display | **36 / 28 px** | 500 | 1.2 | -0.01em | Titres sections |
| **H3** | Playfair Display | **22 / 20 px** | 500 | 1.3 | 0 | Titres cards |
| **Eyebrow** | Inter (`font-sans`) | **12 / 12 px** | 600 | 1 | +0.08em uppercase | Accents section, `text-accent-700` |
| **Body** | Inter | **16 / 17 px** | 400 | 1.6 | 0 | Texte courant, `text-ink-900` |
| **Body-L** | Inter | **18 / 18 px** | 400 | 1.55 | 0 | Sous-titre hero |
| **Small** | Inter | **14 / 14 px** | 400 | 1.5 | 0 | Méta, `text-ink-600` |
| **Price** | Inter | **18 / 18 px** | 600 | 1.2 | 0 | Montants TTC, format `XX,XX €` |

---

## 4. Espacements (échelle 4 px — `tokens.spacing`)

- **Marges pages** : `px-4 sm:px-6 lg:px-8` (24 → 32 px) ; sections en `py-16 lg:py-24` (64 → 96 px).
- **Gaps grilles** : `gap-6 lg:gap-8` (24 → 32 px entre cards).
- **Gaps intra-composants** : `gap-3` (12 px) entre CTAs, `gap-4` (16 px) entre titre/sous-titre.
- **Cards padding interne** : `p-4` mobile / `p-6` desktop.
- **Section → section** : `py-16 lg:py-24` (64 / 96 px).
- **Header height** : `h-16` mobile (64 px) / `h-[72px]` desktop (72 px).

---

## 5. Sections

### 5.1 Header (sticky, `top-0`, z-50)
- Hauteur **72 px desktop / 64 px mobile**, fond `surface` (`ink.50`), `border-b border-ink-200`.
- Composition : logo (gauche, lien `/`) · nav principale (centre, 5 items : Collections / Nouveautés / Cadeaux / Maison / Journal) · cluster droite (recherche → drawer US-03, wishlist, compte, panier + badge compteur dynamique US-04).
- Après **8 px** de scroll : `bg-white/95 backdrop-blur-sm` (effet glass léger).
- Mobile : nav derrière `button[aria-expanded]`, drawer plein écran avec accordéon (AC-HOME-10 CA3).

### 5.2 Hero (80 vh, `lg:grid-cols-12`)
- Hauteur : **80 vh** desktop (min 560 px, max 720 px) / auto mobile, gap `lg:gap-12`.
- **Bloc gauche (5 col)** : eyebrow "Nouveautés · Hiver 2026" → H1 (≤ 60 char AC-HOME-01) → sous-titre (≤ 150 char AC-HOME-02, `text-ink-700`) → 2 CTAs (`Button` primary "Découvrir les collections" → `/collections` + outline "Lire notre manifeste" → `/concept`).
- **Bloc droit (7 col)** : photo plein cadre format 4:5 (WebP/AVIF, `alt` informatif ≤ 125 char, `priority` Next/Image = LCP element, ≤ 200 KB AC-HOME-04).
- Fond : `bg-ink-50` dégradé très subtil vers `bg-white`, jamais de blanc clinique (§9).

### 5.3 Collections vedettes (3-4)
- Header section : H2 "Collections vedettes" + lien "Toutes les collections →" aligné droite (Button `variant="link"`).
- Grille asymétrique §9 : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` avec **1 carte vedette en `lg:col-span-2 lg:row-span-2`** (carré plus grand) + 3 cartes standards.
- Card : photo 4:5 paysage (`alt` descriptif) → titre H3 → meta small muted "12 pièces".
- Hover (cf. 6.1).

### 5.4 Produits vedettes (4-8)
- Header section : H2 "Nos coups de cœur" + lien "Voir tout →" aligné droite.
- Grille `grid-cols-2 lg:grid-cols-4` (8 produits affichés par défaut, configuré CMS).
- Card produit : photo 4:5 carrée (`loading="lazy"` sauf 1ère, `srcset` AVIF/WebP) → titre H3 (1 ligne, ellipsis) → `<Price>` 18 px → badge éventuel ("Nouveau" / "Édition limitée" — `Badge` `variant="accent"`).
- Toute la card = lien `<a>` → `/products/[slug]` (zone cliquable large).

### 5.5 Bandeau manifeste (optionnel, skipped mobile)
- Fond `bg-accent-50` (terracotta très dilué), centré, padding `py-12 lg:py-20`.
- Eyebrow `text-accent-700` "Notre manifeste" + H2 serif 28 px + body-L 18 px, max-w-prose.
- **Mobile : rendu différé** (sauté du SSR, lazy-mounté au scroll) pour préserver LCP (AC-HOME-15).

### 5.6 Footer (`bg-ink-900 text-ink-100`)
- 4 colonnes desktop / accordéon mobile (1 col empilée).
- **Col 1** : logo blanc + tagline + pictos paiement (CB / Visa / MC / PayPal / Stripe) — ligne fine dessinée main, pas d'icônes génériques.
- **Col 2 Boutique** : Collections, Nouveautés, Cadeaux, Carte cadeau.
- **Col 3 Maison** : Concept, Savoir-faire, Journal, Carrières.
- **Col 4 Aide** : Contact, FAQ, Livraison, Retours + sélecteur langue FR/EN.
- Bottom bar : CGU · CGV · Mentions · RGPD · Cookies (AC-HOME-08) + copyright + réseaux (pictos main, pas d'emoji).

---

## 6. États critiques

### 6.1 Hover produit (cards collections + produits)
- Photo : `group-hover:scale-[1.02]` sur 200 ms ease-out.
- CTA secondaire "Aperçu rapide" : `opacity-0 group-hover:opacity-100`, transition 200 ms, apparaît en bas de la photo.
- Curseur : `cursor-pointer` (implicite via `<a>`).

### 6.2 Focus visible (WCAG AA — AC-HOME-12/13)
- Ring global : **2 px `accent.600`** (terracotta) + **offset 2 px** sur **tous** éléments interactifs (Button DS intègre déjà `focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2`).
- Contraste ring ≥ **3:1** vs fond adjacent (vérifié, AA Large).
- **Skip-link** `<a href="#main">` "Aller au contenu principal", `sr-only focus:not-sr-only`, visible au 1er Tab.
- `:focus-visible` partout (jamais `:focus` — corrige le dette TechLead M2).
- `:focus-visible` cards produit : ring sur le `<a>` parent, pas sur la photo seule.

### 6.3 Panier vide (drawer US-04)
- Drawer 480 px desktop / fullscreen mobile, transition slide-in 240 ms.
- État vide : **illustration trait dessiné main** (panier en argile vide, 200×200 px, `aria-hidden`) + H3 "Votre panier vous attend" + body "Découvrez nos collections pour le composer." + 2 CTAs (primary "Voir les collections" + link "Continuer mes achats").
- **Aucune mention de prix ou total** (état vide = pas de montant).

### 6.4 Recherche ouverte (US-03)
- **Desktop** : dropdown **640 px** sous l'input, ancrage droit, `max-h-[480px] overflow-y-auto`.
- **Mobile** : **overlay fullscreen**, input `autofocus`, bouton fermer X (44×44 px).
- ARIA : combobox + listbox, `aria-expanded`, `aria-activedescendant`, `aria-controls`, annonce live `aria-live="polite"` du nombre de résultats (300 ms debounce, max 8 résultats avec `<mark>` sur terme, AC-HOME-03 CA1/CA2).
- État 0 résultat : "Aucun résultat pour « {query} »" + 3 suggestions éditoriales (AC-HOME-03 CA3).
- Touche `Échap` ferme + restore focus sur l'input.

---

## 7. Accessibilité & perf (rappels AC-HOME-12/13/14/15)

- **1 seul `<h1>`** (hero), `<h2>` par section, **pas de saut de niveau** (axe `heading-order` 0 violation).
- Landmarks : `<header role="banner">` · `<main id="main">` · `<footer role="contentinfo">` · `<nav role="navigation">` (un seul `<nav>` principal, AC-HOME-07).
- Images : `alt` informatif ≤ 125 char (informatives) ou `alt=""` (décoratives).
- **JSON-LD `Organization`** injecté dans `<head>` : `name`, `url`, `logo`, `sameAs` (Instagram, Pinterest) — AC-HOME-14.
- Next/Image : `priority` sur LCP hero, `loading="lazy"` partout ailleurs, AVIF/WebP via `next.config`.
- Polices : `font-display: swap` + `preload` du subset latin Playfair Display 500 (réduit CLS).
- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms, Lighthouse ≥ 90 (AC-HOME-15).

---

## 8. Mapping US → écran

| US | Section / composant | Notes |
|---|---|---|
| **US-01** Catalogue navigable | Nav header + Collections vedettes | Liens directs vers `/collections/[slug]` |
| **US-03** Recherche & filtres | Input header (état 6.4) | Dropdown/overlay, ARIA combobox |
| **US-04** Panier persistant | Bouton panier header (badge) + drawer (état 6.3) | Compteur dynamique, localStorage + DB si loggué |
| **US-16** Filtre Cadeau | Entrée nav "Cadeaux" → drawer occasion | Pas sur la home directement, mais CTA "Trouver un cadeau" dans Hero si espace (à arbitrer M2) |

---

## 9. Notes d'implémentation pour @Frontend Dev

1. **Server Component par défaut** : `app/page.tsx` reste RSC ; seuls `HeaderSearch`, `CartDrawer`, `MobileMenu` deviennent Client Components (`"use client"`).
2. **Tokens** : importer `accent`, `ink`, `spacing` depuis `@ui/tokens` ; ne JAMAIS hardcoder `#C04A2A` ou autre couleur dans un composant.
3. **Fonts** : configurer Playfair Display + Inter via `next/font/google` dans `app/layout.tsx` (subset `latin`, `display: 'swap'`).
5. **Images** : `<Image fill priority>` pour le hero, `<Image>` standard pour le reste, `sizes` explicite sur chaque grid.
6. **A11y** : tester avec `axe-core` Playwright (`@axe-core/playwright`) — référence `qa/e2e/home.spec.ts` SCN-HOME-01.
7. **Ne pas implémenter** le bandeau manifeste tant que la home n'est pas verte sur LCP desktop (gate perf).