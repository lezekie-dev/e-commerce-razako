# Acceptance Criteria — Home Page

**Feature** : Home page (page d'accueil e-commerce)
**Owner** : Tech Lead (impl.) / QA (qualif)
**Mission** : Mission #1 QA (Chief)
**Date** : 2025
**Version** : 1.0
**Référence** : `qa/e2e/home.spec.ts` (3 scénarios Playwright)

---

## Méthodologie

- Format **GIVEN / WHEN / THEN** binaire (passe / ne passe pas).
- Sévérité **P0** = bloquant release / **P1** = bloquant qualité / **P2** = nice-to-have.
- Vérification **automatisée** via Playwright + axe-core (cf. `qa/e2e/home.spec.ts`).
- Vérification **manuelle** pour SEO/JSON-LD (Google Rich Results) et a11y expert (NVDA/VoiceOver).
- Outils : `axe-core/playwright`, Lighthouse CI, `schema.org` validator, console DevTools.

---

## AC-HOME-01 — Hero : titre H1 (P0)

**GIVEN** un utilisateur arrive sur `/`
**WHEN** la page est rendue (DOMContentLoaded)
**THEN**
- Un élément `<h1>` est présent, **unique** dans le `<main>`, longueur ≤ 60 caractères.
- Il est visible **sans scroll** (above the fold, viewport 1280×800).
- Lisible par lecteur d'écran (pas de `aria-hidden`, pas de `display:none`).
- **Vérif** : `page.getByRole('heading', { level: 1 })` retourne **exactement 1** élément visible.

## AC-HOME-02 — Hero : sous-titre (P0)

**GIVEN** le hero est affiché
**WHEN** le sous-titre est lu
**THEN**
- Présent, longueur ≤ 150 caractères, complète le H1 sans le répéter.
- Contraste texte/fond ≥ **4.5:1** (WCAG AA).
- **Vérif** : `axe-core` ne remonte aucune violation `color-contrast` sur le sélecteur du sous-titre.

## AC-HOME-03 — Hero : CTA principal (P0)

**GIVEN** le hero est affiché
**WHEN** l'utilisateur clique / tape `Enter` sur le CTA
**THEN**
- Bouton ou lien avec rôle `button`/`link`, libellé explicite (≠ "En savoir plus" sans contexte).
- Contraste ≥ 4.5:1, **focus visible** (outline 2px min, ratio ≥ 3:1 vs fond).
- Au clic/Enter → navigation vers `/collections` ou URL configurée en CMS.
- **Vérif** : `await cta.click()` → `page.url()` matche `/collections`.

## AC-HOME-04 — Hero : image (P0)

**GIVEN** le hero contient une image
**WHEN** la page est chargée
**THEN**
- Format **WebP ou AVIF** avec fallback.
- Poids ≤ **200 KB** (cible LCP).
- `alt` informatif, ≤ 125 caractères, pertinent.
- Élément identifié comme **LCP element** dans Lighthouse (rapport perf).
- **Vérif** : `await heroImg.evaluate(el => el.currentSrc)` retourne `.webp` ou `.avif` ; `await heroImg.getAttribute('alt')` non vide.

## AC-HOME-05 — Section "Collections vedettes" (P0)

**GIVEN** la section "Collections vedettes" est rendue
**WHEN** l'utilisateur la consulte
**THEN**
- Présente **3 à 4 collections** (grille responsive).
- Chaque carte : image (alt descriptif), titre, lien vers `/collections/[slug]`.
- Section annoncée comme landmark ou possède un `<h2>` (ex: "Collections vedettes").
- **Vérif** : `page.locator('[data-testid="featured-collections"] a').count()` ∈ [3, 4].

## AC-HOME-06 — Section "Produits vedettes" (P0)

**GIVEN** la section "Produits vedettes" est rendue
**WHEN** l'utilisateur la consulte
**THEN**
- Présente **4 à 8 produits**.
- Chaque carte : image (alt descriptif, **lazy-load** sauf 1ère), nom, prix **TTC + devise** (format `XX,XX €`), lien vers `/products/[slug]`.
- Section possède `<h2>` ("Produits vedettes" / "Nos coups de cœur").
- **Vérif** : `page.locator('[data-testid="featured-products"] a[href*="/products/"]').count()` ∈ [4, 8] ; `await price.textContent()` matche `/\d+,\d{2}\s*€/`.

## AC-HOME-07 — Header (P0)

**GIVEN** un utilisateur est sur n'importe quelle page
**WHEN** le header est rendu
**THEN**
- Contient : logo (lien retour `/`), navigation principale (`<nav>` + `<ul>`), recherche, panier (avec compteur dynamique), compte.
- Sticky en scroll (`position: sticky` ou `fixed`) sans masquer le contenu.
- `<header role="banner">` avec lang cohérent.
- **Vérif** : `await page.getByRole('banner')` visible ; `await page.getByRole('navigation')` count == 1.

## AC-HOME-08 — Footer : liens légaux (P1)

**GIVEN** l'utilisateur scrolle en bas de la home
**WHEN** le footer est rendu
**THEN**
- Présents : **CGU**, **CGV**, **Mentions légales**, **Politique de confidentialité**, **Contact**, **À propos**.
- Tous les liens ouvrent soit dans le même onglet (navigation interne) soit `target="_blank" rel="noopener"`.
- Footer = `<footer role="contentinfo">`.
- **Vérif** : 6 liens minimum listés ci-dessus présents, tous avec `href` non vide.

## AC-HOME-09 — Footer : RGPD & langues (P1)

**GIVEN** l'utilisateur consulte le footer
**WHEN** il cherche les options conformité / i18n
**THEN**
- Lien "Gestion des cookies" / "RGPD" présent et fonctionnel (ouvre bandeau ou page).
- Sélecteur de langue avec **minimum FR + EN** (drapeaux ou codes ISO).
- **Vérif** : `await page.getByRole('link', { name: /cookies?|rgpd/i })` count ≥ 1 ; `await page.getByRole('combobox', { name: /langue/i })` ou équivalent présent.

## AC-HOME-10 — Responsive mobile (≤ 768px) (P0)

**GIVEN** un viewport mobile (iPhone 13 : 390×844)
**WHEN** la home est chargée
**THEN**
- Menu nav devient **hamburger** (caché derrière `<button aria-expanded>`).
- Hero reste lisible (titre non tronqué, CTA cliquable ≥ 44×44 px).
- Grilles produits/collections passent en **1 colonne** (ou 2 si tablette).
- Pas de scroll horizontal (`document.documentElement.scrollWidth === viewport`).
- **Vérif** : `await page.setViewportSize({ width: 390, height: 844 })` puis assertions ci-dessus.

## AC-HOME-11 — Responsive tablette (768-1024px) (P1)

**GIVEN** un viewport tablette (iPad : 768×1024)
**WHEN** la home est chargée
**THEN**
- Grilles produits/collections en **2 colonnes**.
- Hero reste horizontal (image + texte côte à côte si design prévu).
- Tap targets ≥ 44×44 px.
- **Vérif** : `await page.setViewportSize({ width: 768, height: 1024 })`.

## AC-HOME-12 — Accessibilité WCAG AA (P0)

**GIVEN** un utilisateur navigue au clavier / lecteur d'écran
**WHEN** il interagit avec la home
**THEN**
- **0 violation critique `axe-core`** (règles WCAG 2.1 AA).
- Ratio contraste texte ≥ **4.5:1** (3:1 pour large text ≥ 18pt ou 14pt bold).
- Navigation clavier **complète** (Tab order logique, pas de piège à focus).
- **Focus visible** sur tous les éléments interactifs (outline ou équivalent).
- **Vérif** : `await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()` → 0 violations `critical`/`serious`.

## AC-HOME-13 — A11y : alt & landmarks ARIA (P1)

**GIVEN** la home est rendue
**WHEN** un lecteur d'écran parcourt la page
**THEN**
- Images décoratives : `alt=""` (vide explicite).
- Images informatives : `alt` descriptif et concis.
- Landmarks ARIA présents : `banner` (header), `main` (zone principale), `contentinfo` (footer), `navigation` (nav).
- Hiérarchie de titres **cohérente** : un seul `<h1>`, `<h2>` pour sections, pas de saut de niveau.
- **Vérif** : `await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()` → 0 violations sur `image-alt`, `region`, `heading-order`.

## AC-HOME-14 — SEO (P0)

**GIVEN** un crawler (Googlebot) visite `/`
**WHEN** il parse le HTML
**THEN**
- `<title>` ≤ **60 caractères**, unique, contient le nom de la marque.
- `<meta name="description">` ≤ **155 caractères**, incitative.
- **JSON-LD `Organization`** valide (schema.org), avec `name`, `url`, `logo`, `sameAs` (réseaux).
- `robots.txt` autorise `/`, `sitemap.xml` référence `/`.
- Balise `<link rel="canonical">` pointe vers l'URL absolue canonique.
- **Vérif** : `await page.title()` length ≤ 60 ; extraction du JSON-LD et validation via [schema.org validator](https://validator.schema.org/).

## AC-HOME-15 — Performance (P0)

**GIVEN** la home est servie en production (build minifié, CDN)
**WHEN** Lighthouse CI l'audite en condition réelle (4G, mobile)
**THEN**
- Lighthouse Performance ≥ **90**.
- **LCP ≤ 2.5 s**, **CLS ≤ 0.1**, **INP ≤ 200 ms** (Core Web Vitals "Good").
- JS bundle initial ≤ **180 KB gzipped**.
- Images responsive (`srcset` + `sizes`).
- Polices en `font-display: swap` + `preload` du subset critique.
- **Vérif** : `lhci collect --url=https://staging.maison14.fr/` avec budget JSON (`performance: 90`, `lcp: 2500`, `cls: 0.1`).

---

## Synthèse couverture

- **15 AC** au total · **10 P0** (bloquants) · **5 P1** (qualité) · **0 P2**
- AC P0 à automatiser : **AC-HOME-01, 02, 03, 04, 05, 06, 10, 12, 14, 15**
- AC P1 à automatiser : **AC-HOME-07, 08, 09, 11, 13**
- AC à valider manuellement : AC-HOME-14 (JSON-LD schema.org), AC-HOME-12 (NVDA/VoiceOver)

## Mapping vers `qa/e2e/home.spec.ts`

| Scénario Playwright | AC couvertes |
|---|---|
| SCN-HOME-01 (load < 2s, hero visible, ≥1 produit cliquable) | AC-HOME-01, 02, 03, 04, 06 |
| SCN-HOME-02 (clic produit → fiche) | AC-HOME-06, 14 |
| SCN-HOME-03 (clic Panier header → page panier) | AC-HOME-07 |

Les AC P1 + responsive + a11y (axe-core) sont implémentées dans le même fichier via `test.describe` additionnels.

## Critères de sortie (sortie de Mission #1)

- ✅ 15/15 AC rédigées (G/W/T)
- ✅ 3/3 scénarios e2e Playwright TS livrés
- ⏳ En attente du code home page (Tech Lead) pour exécution
