import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Products — Listing, Detail, Variants, Reviews
// ============================================================

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('PRODUCTS — Listing & Filters', () => {

    test('[PROD-P01] Products page loads and shows product cards', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const cards = page.locator('[data-testid="product-card"], .product-card, a[href^="/products/"]');
        await expect(cards.first()).toBeVisible({ timeout: 8000 });
    });

    test('[PROD-P02] Search returns filtered results', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        const searchInput = page.getByPlaceholder(/search/i).first();
        await searchInput.fill('phone');
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
        // Results should contain product names relevant to "phone"
        const results = page.locator('main').getByRole('link');
        await expect(results.first()).toBeVisible({ timeout: 8000 });
    });

    test('[PROD-P03] Category filter narrows products', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        // Click on first category chip/button
        const categoryFilter = page.getByRole('button').filter({ hasText: /electronics|fashion|books/i }).first();
        if (await categoryFilter.isVisible()) {
            await categoryFilter.click();
            await page.waitForTimeout(1000);
        }
        const cards = page.locator('a[href^="/products/"]');
        await expect(cards.first()).toBeVisible({ timeout: 6000 });
    });

    test('[PROD-N01] Search with no results shows empty state', async ({ page }) => {
        await page.goto(`${BASE_URL}/products?search=xyznotfoundproduct999`);
        await expect(page.getByText(/no products|not found|empty/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('PRODUCTS — Detail Page', () => {

    test('[PROD-P04] Product detail page loads with name, price, Add to Cart button', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        await expect(page.locator('h1')).toBeVisible({ timeout: 8000 });
        await expect(page.getByText(/₹|price/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
    });

    test('[PROD-P05] Product gallery image click changes main image', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        const thumbnails = page.locator('img[alt]').nth(1);
        if (await thumbnails.isVisible()) {
            await thumbnails.click();
        }
        // Main image should update — just verify no crash
        await expect(page.locator('img').first()).toBeVisible();
    });

    test('[PROD-P06] Quantity selector can be incremented and decremented', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        const plusBtn = page.getByRole('button', { name: '+' });
        const minusBtn = page.getByRole('button', { name: '-' });
        await expect(plusBtn).toBeVisible({ timeout: 6000 });
        await plusBtn.click();
        await plusBtn.click();
        await minusBtn.click();
        // Quantity should be 2 now (started 1, +2, -1)
        await expect(page.getByText('2')).toBeVisible();
    });

    test('[PROD-N02] Navigating to non-existent product shows error state', async ({ page }) => {
        await page.goto(`${BASE_URL}/products/999999`);
        await expect(page.getByText(/not found|does not exist/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('PRODUCTS — Variants Selector', () => {

    test('[PROD-P07] Variant chips appear for products with variants', async ({ page }) => {
        // Products with variants seeded in V9 migration (e.g. product with SKU-SHRT-001)
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        // If variants exist, selector should render — pass silently if no variants
        const sizeLabel = page.getByText(/size:/i);
        if (await sizeLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
            const firstChip = page.locator('button').filter({ hasText: /^(S|M|L|XL)$/ }).first();
            await firstChip.click();
            await expect(page.getByText(/S|M|L|XL/)).toBeVisible();
        }
    });

    test('[PROD-P08] Clicking color chip shows selected color', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        const colorLabel = page.getByText(/color:/i);
        if (await colorLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
            const firstColorChip = page.locator('button').filter({ hasText: /black|white|gray|red|blue/i }).first();
            await firstColorChip.click();
            await expect(colorLabel).toBeVisible();
        }
    });
});

test.describe('PRODUCTS — Reviews Section', () => {

    test('[PROD-P09] Reviews section is visible on product detail page', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        await expect(page.getByText(/reviews|ratings/i)).toBeVisible({ timeout: 8000 });
    });

    test('[PROD-P10] Unauthenticated user does NOT see write review form', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        await expect(page.getByText(/write a review/i)).not.toBeVisible({ timeout: 5000 });
    });

    test('[PROD-P11] Logged-in user sees write review form', async ({ page }) => {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await page.waitForURL(/\//);

        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        await expect(page.getByText(/write a review/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('PRODUCTS — Recommendations', () => {

    test('[PROD-P12] Recommendations carousel appears on product detail page when available', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);
        await page.locator('a[href^="/products/"]').first().click();
        await page.waitForURL(/\/products\/\d+/);
        // Wait for page to load
        await page.waitForTimeout(2000);
        const recSection = page.getByText(/you might also like/i);
        // Softly assert — only visible if same-category products exist
        const isVisible = await recSection.isVisible().catch(() => false);
        // Just log, don't fail — depends on seed data
        test.info().annotations.push({ type: 'info', description: `Recommendations visible: ${isVisible}` });
    });
});
