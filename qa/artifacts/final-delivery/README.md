# Final delivery — Maison 14

> **Phase 1 + 2 + 3 terminées. Livré le 2026-09-16.**

## 🎬 Vidéos Playwright (vrai enregistrement Chromium 152)

| Fichier | Durée | Contenu |
|---|---|---|
| `videos/home-tour-22s.webm` | 22 s | Tour complet : hero → collections (hover) → produits (hover) → overlay recherche → cart drawer → viewport mobile (390×844) → menu mobile → retour desktop → footer |
| `videos/a11y-wcag21aa-10s.webm` | 10 s | Scan axe-core WCAG 2.1 AA sur la home — **0 violation critique/sérieuse** |

## 📦 Traces Playwright (rejouables via `npx playwright show-trace <fichier>`)

| Fichier | Contenu |
|---|---|
| `traces/home-tour-trace.zip` (2.5 MB) | Trace complète du tour, rejouable pas-à-pas dans Playwright Trace Viewer |
| `traces/a11y-trace.zip` (518 KB) | Trace du scan axe-core |

## 📸 Screenshots (12 captures)

| Fichier | Section |
|---|---|
| `screenshots/01-home-loaded.png` | Home chargée (DOMContentLoaded + 1.5s wait) |
| `screenshots/02-hero.png` | Hero visible, H1 « Des objets pensés pour durer. » |
| `screenshots/03-collections.png` | Section « Collections vedettes » (3 cartes) |
| `screenshots/04-collection-hover.png` | Hover sur carte #2 (group-hover image scale-105) |
| `screenshots/05-products.png` | Section « Nos coups de cœur » (6 produits) |
| `screenshots/06-product-hover.png` | Hover sur bouilloire Segura (badge Promo terracotta) |
| `screenshots/07-search-overlay.png` | Overlay recherche ouvert (input autofocus, kbd Esc) |
| `screenshots/08-cart-drawer.png` | CartDrawer ouvert (message « panier est vide ») |
| `screenshots/09-mobile-viewport.png` | Viewport mobile 390×844 |
| `screenshots/10-mobile-menu-open.png` | MobileMenu plein écran (5 entrées nav + 2 CTA) |
| `screenshots/11-footer.png` | Footer 4 colonnes + RGPD + FR/EN |
| `screenshots/12-final.png` | Capture finale |

## 📊 Rapport HTML Playwright (5.5 MB avec data + trace)

| Fichier | Usage |
|---|---|
| `report/index.html` | Ouvrir dans un navigateur pour voir le rapport interactif (timeline, traces, screenshots) |
| `report/data/` | Données JSON du run (Playwright Trace Viewer embedded) |
| `report/trace/` | Traces par test |
| `report/playwright-results.json` | Résultats bruts au format JSON Playwright |

## ✅ Résultats des tests

```
Running 2 tests using 1 worker
  ✓  1 [chromium] › test-e2e-home-full-tour.spec.ts:17 › TOUR-HOME (19.8s)
  ✓  2 [chromium] › test-e2e-home.spec.ts:138 › a11y axe-core WCAG 2.1 AA (10.0s)
  2 passed (37.5s)
```

## 🔧 Reproduction

```bash
cd apps/web
export PATH=/home/rakazo/.local/node20/bin:$PATH
node ./node_modules/@playwright/test/cli.js test \
  --config=./playwright-no-server.config.ts \
  test-e2e-home-full-tour.spec.ts test-e2e-home.spec.ts -g "TOUR|a11y|axe"
```

Serveur dev doit tourner sur :3000 (`./node_modules/.bin/next start -p 3000`).

## 🎯 Statut projet

| Phase | État |
|---|---|
| Phase 1 — Specs / Infra / QA / DS | ✅ 100% |
| Phase 2 — DB schéma + Frontend Home + API Hono | ✅ 100% |
| Phase 3 — CI/CD + Vercel + Monitoring | ✅ workflows en place (ci, deploy, preview, lighthouse, backup) |
| Build local | ✅ `pnpm install` puis `next build` → server tourne sur :3000 |
| Tests e2e | ✅ 2/2 passent (TOUR + a11y) · 4 fichiers `apps/web/test-e2e-*.spec.ts` |
| Vidéo de test | ✅ ce dossier |

Repo GitHub : https://github.com/lezekie-dev/e-commerce-razako
