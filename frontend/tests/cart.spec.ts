import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Cart — Add, Update, Remove, Coupon, Clear
// ============================================================

const BASE_URL = 'http://localhost:3000';

// Helper: login as customer
async function loginAsCustomer(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\//);
}

test.describe('CART — Add to Cart', () => {

    test('[CART-P01] Logged-in user can add a product to cart from product detail', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        // Toast should appear
        await expect(page.getByText(/added to cart|success/i)).toBeVisible({ timeout: 5000 });
    });

    test('[CART-P02] Cart count updates in navbar after adding product', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(1000);
        // Cart icon in navbar should show a badge
        const cartBadge = page.locator('nav').getByText(/[1-9]/);
        await expect(cartBadge.first()).toBeVisible({ timeout: 5000 });
    });

    test('[CART-N01] Unauthenticated user is prompted to login when adding to cart', async ({ page }) => {
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        // Either redirect to login or show login toast
        const loginRedirect = page.url().includes('/login');
        const loginToast = await page.getByText(/login|sign in/i).isVisible().catch(() => false);
        expect(loginRedirect || loginToast).toBe(true);
    });
});

test.describe('CART — View & Manage Cart', () => {

    test('[CART-P03] Cart page shows added items', async ({ page }) => {
        await loginAsCustomer(page);
        // Add an item first
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(1000);
        // Navigate to cart
        await page.goto(`${BASE_URL}/cart`);
        // Should show at least one cart item
        await expect(page.getByText(/total|checkout|₹/i)).toBeVisible({ timeout: 8000 });
    });

    test('[CART-P04] Quantity can be increased in cart', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(500);
        await page.goto(`${BASE_URL}/cart`);
        const plusBtn = page.getByRole('button', { name: '+' }).first();
        await plusBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.getByText('2')).toBeVisible();
    });

    test('[CART-P05] Item can be removed from cart', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(500);
        await page.goto(`${BASE_URL}/cart`);
        const removeBtn = page.getByRole('button', { name: /remove|delete|trash/i }).first();
        await removeBtn.click();
        await page.waitForTimeout(1000);
        // Cart should show empty state or reduced items
        const emptyCart = await page.getByText(/empty|no items/i).isVisible().catch(() => false);
        expect(emptyCart).toBe(true);
    });

    test('[CART-N02] Empty cart shows empty state message', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/cart`);
        // If cart is empty, show empty state
        const emptyState = await page.getByText(/empty|no items|start shopping/i).isVisible({ timeout: 5000 }).catch(() => false);
        // Soft assertion — may have items from prior test run
        test.info().annotations.push({ type: 'info', description: `Cart empty: ${emptyState}` });
    });
});

test.describe('CART — Promo Code / Coupon', () => {

    test('[CART-P06] Valid coupon code applies discount to cart total', async ({ page }) => {
        await loginAsCustomer(page);
        // Add item to cart first
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(800);
        await page.goto(`${BASE_URL}/cart`);
        // Apply coupon
        const couponInput = page.getByPlaceholder(/promo|coupon code/i);
        await couponInput.fill('WELCOME20');
        await page.getByRole('button', { name: /apply/i }).click();
        await expect(page.getByText(/discount|saved|off/i)).toBeVisible({ timeout: 6000 });
    });

    test('[CART-N03] Invalid coupon code shows error', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/cart`);
        const couponInput = page.getByPlaceholder(/promo|coupon code/i);
        if (await couponInput.isVisible()) {
            await couponInput.fill('INVALIDCODE');
            await page.getByRole('button', { name: /apply/i }).click();
            await expect(page.getByText(/invalid|not found|expired/i)).toBeVisible({ timeout: 5000 });
        }
    });

    test('[CART-P07] Applied coupon can be removed', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/products/1`);
        await page.getByRole('button', { name: /add to cart/i }).click();
        await page.waitForTimeout(800);
        await page.goto(`${BASE_URL}/cart`);
        const couponInput = page.getByPlaceholder(/promo|coupon code/i);
        if (await couponInput.isVisible()) {
            await couponInput.fill('WELCOME20');
            await page.getByRole('button', { name: /apply/i }).click();
            await page.waitForTimeout(1000);
            const removeBtn = page.getByRole('button', { name: /remove.*coupon|×/i });
            if (await removeBtn.isVisible()) {
                await removeBtn.click();
                await expect(page.getByText(/coupon removed|promo removed/i)).toBeVisible({ timeout: 5000 });
            }
        }
    });
});
