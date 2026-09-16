# QA — Mission M1 (Configs) — Statut livraison

> Déposé par @QA le [17:25] (Europe/Paris). À fusionner dans `BOARD.md` par @Chief à la prochaine passe.

---

## Statut

`[17:25] @QA — Mission M1 Configs LIVRÉE ✅`

---

## Preuve disque (sandbox `bots/cmu4blzn5069v11s0w40h1j5b/`, vérifiée `list_files` à l'instant)

| Fichier | Taille | Rôle |
|---|---|---|
| `playwright.config.ts` (racine) | **1 855 o** | Playwright 3 navigateurs (chromium/firefox/webkit), baseURL `http://localhost:3000`, webServer `pnpm --filter @ecommerce/web dev` timeout 120 s `reuseExistingServer: !CI`, reporters `[['list'],['html'],['allure-playwright']]`, use `{ trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure' }`, timeout 30 s |
| `vitest.config.ts` (racine) | **2 087 o** | Vitest `globals: true`, `environment: 'jsdom'`, `setupFiles: ['qa/unit/setup.ts']`, coverage v8 reporters `text/html/lcov/json-summary`, seuils `lines/branches/functions/statements = 80` |
| `qa/e2e/helpers/a11y.ts` | **4 149 o** | Helper `expectNoA11yViolations(page, options?)` + variante soft `getA11yViolations()`, défauts `failOn: ['critical','serious']` + `tags: ['wcag2a','wcag2aa','wcag21a','wcag21aa']`, options `disabledRules`/`contextSelector`/`testName`, rapport détaillé (rule id, count, help URL, premier node + html tronqué) |

**Contenu complet livré dans message utilisateur** (codes triple-backticks). Chief peut consolider directement chez lui dans `shared/ecommerce/` racine + `shared/ecommerce/qa/e2e/helpers/`.

---

## Audit `qa/e2e/home.spec.ts` vs Playwright 1.45+

**Verdict : 100 % compatible, AUCUN patch requis.** Toutes APIs utilisées sont stables depuis ≥ 1.27 (`getByRole`, `getByRole('banner')`, `Promise.all([waitForURL, click])`, `AxeBuilder({ page }).withTags().analyze()` 4.x, `expect.toBeVisible/toHaveCount/toHaveAttribute/toMatch`, etc.).

---

## Callouts ops

### → @DevOps
Ajouter en `devDependencies` racine (lors de sa prochaine mission) :
- `@playwright/test@^1.45.0`
- `@axe-core/playwright@^4.10.0`
- `allure-playwright@^2.15.0`
- `axe-core@^4.10.0` (peer)
Bumper aussi `@playwright/test` dans `apps/web/package.json` de `^1.44.0` → `^1.45.0`.

### → @Frontend Dev
Poser 2 `data-testid` au code applicatif (Phase 2 build, home + PDP) :

| data-testid | Emplacement | Justification |
|---|---|---|
| `featured-products` | `apps/web/app/page.tsx` — `<section>` wrappant la grille "Produits vedettes" | Sélecteur racine grille produit pour SCN-HOME-01 et SCN-HOME-02 |
| `product-price` | `apps/web/app/products/[slug]/page.tsx` — bloc prix principal (`<Price>` ou `<span>`) | Vérif prix fr-FR EUR via regex `/\d+,\d{2}\s*€/` (SCN-HOME-02) |

Aucun data-testid bloquant sur `<header>` / `<footer>` / lien Panier / image hero / H1 (sélecteurs sémantiques `getByRole` suffisent).

---

## Suite

Standby M2 : audit fixtures / MSW / k6 perf / OWASP ZAP.