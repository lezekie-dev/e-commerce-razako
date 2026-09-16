// test-e2e-home-full-tour.spec.ts
// Tour complet de la home + interactions header, pour capturer une vidéo
// représentative de l'expérience utilisateur réelle.

import { test, expect, type Page } from '@playwright/test';

const HOME_URL = process.env.HOME_URL ?? 'http://localhost:3000/';

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: `qa/artifacts/screenshots/${name}.png`,
    fullPage: false,
  });
}

test.describe('Home Page — full tour e2e (capture vidéo)', () => {
  test('TOUR-HOME : home → hero → collections → produits → overlays header → footer', async ({
    page,
    context,
  }) => {
    // ─── 1. Charger la home ─────────────────────────────────────────────
    await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
    // Pas de networkidle : certaines images placeholder renvoient 404 et
    // ça bloque le wait. On laisse 1.5s pour que le DOM se stabilise.
    await page.waitForTimeout(1500);
    await shot(page, '01-home-loaded');

    // ─── 2. Vérifier le hero ────────────────────────────────────────────
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1);
    const heroText = (await h1.textContent()) ?? '';
    expect(heroText).toContain('Des objets pensés pour durer');
    await shot(page, '02-hero');

    // ─── 3. CTA hero → /collections ─────────────────────────────────────
    const cta = page.locator('[data-testid="hero-cta"]');
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toBe('/collections');
    await page.waitForTimeout(300);

    // ─── 4. Scroll vers les collections vedettes ────────────────────────
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    await shot(page, '03-collections');

    const collections = page.locator('[data-testid="featured-collections"]');
    await expect(collections).toBeVisible();
    const cards = collections.locator('li');
    expect(await cards.count()).toBe(3);

    // ─── 5. Hover sur la 2e collection (group-hover image) ──────────────
    await cards.nth(1).hover();
    await page.waitForTimeout(500);
    await shot(page, '04-collection-hover');

    // ─── 6. Scroll vers les produits vedettes ───────────────────────────
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await shot(page, '05-products');

    const products = page.locator('[data-testid="featured-products"]');
    await expect(products).toBeVisible();
    const productLinks = products.locator('li a[href*="/products/"]');
    expect(await productLinks.count()).toBeGreaterThanOrEqual(4);

    // ─── 7. Hover sur le 1er produit (badge Promo) ──────────────────────
    await productLinks.first().hover();
    await page.waitForTimeout(500);
    await shot(page, '06-product-hover');

    // ─── 8. Retour en haut, ouvrir l'overlay recherche ──────────────────
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const searchBtn = page.getByRole('button', { name: 'Rechercher' });
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    await page.waitForTimeout(500);
    await shot(page, '07-search-overlay');

    // L'overlay recherche est ouvert (input autofocus visible)
    const searchDialog = page.getByRole('dialog', { name: 'Recherche' });
    await expect(searchDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // ─── 9. Ouvrir le CartDrawer ────────────────────────────────────────
    const cartBtn = page.getByRole('button', { name: 'Panier' });
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    await page.waitForTimeout(500);
    await shot(page, '08-cart-drawer');

    const cartDialog = page.getByRole('dialog', { name: 'Panier' });
    await expect(cartDialog).toBeVisible();
    // Vérifier le message "panier vide" (état initial OK)
    await expect(cartDialog.getByText(/panier est vide/i)).toBeVisible();
    // Fermer avec Esc
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // ─── 10. Ouvrir le menu mobile en passant en viewport mobile ───────
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await shot(page, '09-mobile-viewport');

    const menuBtn = page.getByRole('button', { name: 'Menu' });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await page.waitForTimeout(500);
    await shot(page, '10-mobile-menu-open');

    const mobileDialog = page.getByRole('dialog', { name: 'Menu principal' });
    await expect(mobileDialog).toBeVisible();
    // Vérifier les 5 entrées de nav dans le menu mobile
    const mobileNav = mobileDialog.getByRole('navigation');
    await expect(mobileNav.getByRole('listitem')).toHaveCount(5);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // ─── 11. Retour desktop, scroll vers le footer ──────────────────────
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await shot(page, '11-footer');

    // Vérifier le footer (4 colonnes + RGPD + langue FR/EN)
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Maison 14').first()).toBeVisible();
    await expect(footer.getByText(/Politique de confidentialité/i)).toBeVisible();
    await expect(footer.getByText(/Gestion des cookies/i)).toBeVisible();
    await expect(footer.locator('a[hrefLang="fr"]')).toBeVisible();
    await expect(footer.locator('a[hrefLang="en"]')).toBeVisible();

    await shot(page, '12-final');
  });
});
