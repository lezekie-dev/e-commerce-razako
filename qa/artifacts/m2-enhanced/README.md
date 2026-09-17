# M2 Enhanced — artefacts de la passe "expérience premium"

Date : 17/09/2026 — branche `main` — commit `aa56e2d`

Cette passe ajoute une couche d'effets visuels au-dessus de l'AC-HOME 01-15
et de l'infra M2 existante (catalogue + PDP + cart store Zustand).

## Nouvelles primitives du DS (`@ecommerce/ui`)

| Primitive | Rôle |
|---|---|
| `MotionTextLines` | Titre animé ligne-par-ligne avec mask slide-up (easeOutExpo) |
| `MotionMagnetic` | Wrap qui attire son enfant vers le curseur (sprint spring) |
| `MotionMeshGradient` | Fond mesh-gradient animé (CSS pur + keyframes `mesh-shift`) |
| `MotionCountUp` | Compteur animé 0 → target avec `Intl.NumberFormat` |
| `MotionSpotlight` | Halo radial qui suit le curseur sur la section |
| `ProductCard` (V2) | 3D tilt mousemove + image parallax + shimmer balayant + quick-add avec spring (idle → vert check + scale) |
| `QuantityStepper` (V2) | Bounce animation sur changement + color flash warning/danger aux bornes |

## Nouveaux composants applicatifs

| Composant | Rôle |
|---|---|
| `apps/web/lib/confetti.ts` | Mini confetti sans bundle externe (1-50 particules, gravity + drag) |
| `apps/web/components/hero-floating-orbs.tsx` | 3 orbes flottantes en parallaxe lente (9-11 s loop) |
| `apps/web/components/scroll-progress.tsx` | Barre de progression en haut de page (spring scaleX) |
| `apps/web/components/inspiration-grid.tsx` | Masonry 6 tuiles avec reveal + gradient hover |
| `apps/web/components/newsletter-cta.tsx` | Bloc ink-900 + form avec états idle / loading / success |
| `apps/web/components/cart-drawer.tsx` (V2) | `MotionCountUp` sur subtotal/shipping/total + 🎉 confetti au seuil livraison offerte |
| `apps/web/components/catalog-grid.tsx` (V2) | Sliding pill indicator (`layoutId`) + AnimatePresence sur la grille |
| `apps/web/app/page.tsx` (V2) | Hero mesh + spotlight + orbs + magnetic CTA + count-up stats ; Engagement cards ; Inspiration ; Footer |

## Couverture fonctionnelle

- **AC-HOME 01-15** : toujours couverts (h1, hero, JSON-LD, footer RGPD, etc.)
- **AC-SEARCH-03/04/05** (filtres catégorie, tri, pagination 12/page) : sliding pill indicator sur les filtres
- **AC-PROD-01..06** (PDP) : inchangé + zoom + variants + add-to-cart
- **AC-CART-01..03** (drawer) : `MotionCountUp` sur les chiffres, confetti au seuil
- **a11y** : tous les nouveaux wrappers respectent `prefers-reduced-motion`
- **Perf** : build vert, 24 pages statiques, 167 kB First Load JS sur `/` (incluant Framer Motion)

## Tests

3 tests Playwright passent (1.2 min total) :

```
✓ M2 Enhanced — expérience premium › Tour complet des nouvelles expériences visuelles (45.2s)
✓ M2 Enhanced — expérience premium › Newsletter submit flow (10.7s)
✓ M2 Enhanced — expérience premium › Inspiration masonry grid + footer (7.0s)
```

Run :
```bash
PATH=/home/rakazo/.local/node20/bin:$PATH PORT=3200 \
  PLAYWRIGHT_BROWSERS_PATH=/home/rakazo/.cache/ms-playwright \
  ./node_modules/.bin/playwright test --config=playwright.config.enhanced.ts
```

## Vidéos & traces

| Fichier | Taille | Contenu |
|---|---|---|
| `tour-main.webm` | ~1 MB | Tour complet 1440×900 — 17 frames : home reveal + spotlight + scroll progress + featured products mesh + tilt 3D + quick-add + catalogue + filter pill + PDP + cart drawer + qty bounce + confetti + mobile views |
| `newsletter-flow.webm` | ~50 KB | Newsletter submit flow (idle → filled → loading → success) |
| `inspiration-footer.webm` | ~50 KB | Inspiration masonry + footer |

Toutes les traces `.zip` sont rejouables via `npx playwright show-trace`.

## Screenshots clés

01. **Home hero** — mesh gradient + cursor spotlight + floating orbs
02. **Cursor spotlight** — move mouse sur le hero → halo terracotta qui suit
03. **Scroll progress** — barre terracotta animée en haut
04. **Featured products** — section avec mesh + ProductCard 3D
05. **ProductCard 3D tilt** — hover mousemove → rotation perspective
06. **ProductCard quick-add** — bouton vert "Ajouté" avec check après click
07. **Catalogue** — grille avec hover cards
08. **Catalogue card hover** — tilt + shimmer
09. **Filter pill** — indicateur qui slide entre "Toutes" et "Art de vivre"
10. **PDP** — Vase Terracotta Lorca
11. **PDP add-to-cart** — toast accent + cart count qui se met à jour
12. **Cart drawer** — subtotal MotionCountUp + progress bar livraison gratuite
13. **Cart qty bounce** — chiffre qui slide up/down + color flash
14. **Cart qty high** — après plusieurs incréments, peut-être confetti si seuil atteint
15. **Mobile home** — responsive 390×844
16. **Mobile products** — grille 2 colonnes sur mobile
17. **Mobile engagements** — cards engagement sur mobile
18. **Newsletter idle** — bloc ink-900, halo terracotta pulsant
19. **Newsletter filled** — email rempli
20. **Newsletter loading** — état "Envoi…" avec spinner
21. **Newsletter success** — bouton vert avec check "Inscrit, merci !"
22. **Inspiration masonry** — 6 tuiles asymétriques
23. **Footer** — 4 colonnes + RGPD + sélecteur langue FR/EN

## Limites assumées

| Limite | Pourquoi | Solution |
|---|---|---|
| Images produits = placeholders `.webp` manquants | Designer livre HOME_DESIGN mais pas les assets par produit | Sync Designer Phase 2.5 |
| `Button.asChild` non implémenté → utilise `buttonVariants()` sur `<Link>` | Pattern Radix Slot pas câblé | TechLead backlog M2 |
| Stripe reste mocké · Auth.js pas câblé · DB non connectée | Hors scope M2 | Phase 3 |
| Hero spotlight désactivé sur mobile (touch) | UX correcte (le doigt masquerait le halo) | Volontaire |

## Vérifications

- TypeScript strict : `tsc --noEmit` ✅
- Build : 24/24 pages statiques ✅
- 3 tests Playwright passent en 1.2 min ✅
- MD5 byte-identity sur les fichiers critiques (motion.tsx, product-card.tsx, page.tsx) ✅
- Prefers-reduced-motion respecté partout ✅