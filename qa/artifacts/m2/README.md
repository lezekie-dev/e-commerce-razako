# M2 — Livrables

## Vidéo Playwright (Chromium 152, --video on --trace on)

**`m2-tour-21s.webm`** (646 KB) — Tour complet de l'app M2 :
1. Home (MotionFade hero reveal) → scroll → 2. Catalogue (Filtres catégorie + tri, hover avec quick-add) → 3. PDP Vase Lorca (gallery + accordion matériaux) → 4. Add-to-cart (toast accent) → 5. Cart drawer réel (Zustand persist + barre livraison offerte + qty stepper) → 6. Remove item → empty state → 7. Mobile 390×844 (home / catalogue / PDP)

## Trace Playwright (rejouable)

**`trace.zip`** (3.8 MB) — Ouvrir avec `npx playwright show-trace trace.zip`

## Screenshots clés

- `home.png` — Home (1440×900, MotionFade non-déclenché)
- `catalogue.png` — Catalogue avec 12 produits + filtres catégorie (Toutes, Arts de la table, Art de vivre, Luminaire, Textile) + tri dropdown + breadcrumb JSON-LD
- `pdp.png` — PDP Vase Terracotta Lorca, breadcrumb, prix, variants (Taille S/L), quantity stepper, badges, accordion
- `pdp-add-toast.png` — Toast "Ajouté au panier" après click
- `cart-drawer.png` — Cart drawer avec barre livraison offerte + item + qty stepper + remove + subtotal + CTA "Voir le panier"
- `mobile-home.png` — Home mobile 390×844

## Ce qui a été livré

**Phase 2 élevée M2** : catalogue + PDP + cart store réel + couche d'expérience.

### Apps (15 nouveaux fichiers)
- `apps/web/app/products/page.tsx` (catalogue, 49 lignes)
- `apps/web/app/products/[slug]/page.tsx` (PDP, 69 lignes, generateStaticParams 15 slugs)
- `apps/web/app/collections/page.tsx` (index collections, 81 lignes)
- `apps/web/app/collections/[slug]/page.tsx` (collection filtrée, 100+ lignes)
- `apps/web/components/breadcrumbs.tsx` (JSON-LD BreadcrumbList)
- `apps/web/components/catalog-grid.tsx` (filtres + tri + pagination client)
- `apps/web/components/featured-products-grid.tsx` (grille canonique MotionStagger)
- `apps/web/components/product-detail.tsx` (gallery + variants + add-to-cart + accordions + related)
- `apps/web/components/product-gallery.tsx` (gallery + thumbnails + zoom hover)
- `apps/web/components/variant-selector.tsx` (pills + swatches accessibles)
- `apps/web/components/related-products.tsx` (4 cards horizontales)
- `apps/web/components/cart-button.tsx` (badge réactif pulse)
- `apps/web/components/cart-drawer.tsx` (Zustand + spring + progress shipping)
- `apps/web/components/cart-hydrator.tsx` (réhydrate localStorage)
- `apps/web/components/toast-host.tsx` (Provider wrapper)
- `apps/web/lib/cart-store.ts` (Zustand persist + selectors)
- `apps/web/lib/use-add-to-cart.ts` (hook + toast)
- `apps/web/lib/products.ts` + `products-part1/2/3.ts` + `catalog.ts` (15 produits fake structurés)
- `apps/web/app/page.tsx` (polish : MotionFade + MotionParallax sur hero + eyebrow chip + newsletter section + valeurs)
- `apps/web/app/layout.tsx` (ToastHost + CartHydrator wraps)

### Design System (5 nouveaux fichiers)
- `packages/ui/src/motion.tsx` (MotionFade / MotionStagger / MotionStaggerItem / MotionParallax)
- `packages/ui/src/toast.tsx` (ToastProvider / useToast / ToastViewport)
- `packages/ui/src/product-card.tsx` (ProductCard canonique avec quick-add)
- `packages/ui/src/quantity-stepper.tsx` (Stepper accessible)

## Tests e2e

`qa/e2e/m2-tour.spec.ts` — 1 test qui couvre :
- Home titre + reveal
- Navigation header → catalogue
- Hover card + quick-add visible
- Filtre catégorie
- PDP navigation + accordion
- Add-to-cart → toast
- Cart drawer ouverture + qty stepper + remove + empty state
- Viewport mobile 390×844

**Résultat : 1 passed (20.7s) — Chromium 152**
