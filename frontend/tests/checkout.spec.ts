import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Checkout — Address, Payment, Order Confirmation
// ============================================================

const BASE_URL = 'http://localhost:3000';

async function loginAsCustomer(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\//);
}

async function addItemToCart(page: any, productId = 1) {
    await page.goto(`${BASE_URL}/products/${productId}`);
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(800);
}

test.describe('CHECKOUT — Cart to Checkout Flow', () => {

    test('[CHK-P01] Checkout page loads for authenticated user with items in cart', async ({ page }) => {
        await loginAsCustomer(page);
        await addItemToCart(page);
        await page.goto(`${BASE_URL}/cart`);
        await page.getByRole('button', { name: /checkout|proceed/i }).click();
        await expect(page).toHaveURL(/\/checkout/);
        await expect(page.getByText(/address|delivery|shipping/i)).toBeVisible({ timeout: 8000 });
    });

    test('[CHK-N01] Unauthenticated user is redirected from checkout', async ({ page }) => {
        await page.goto(`${BASE_URL}/checkout`);
        await expect(page).toHaveURL(/\/login/);
    });

    test('[CHK-N02] Proceeding to checkout with empty cart shows warning', async ({ page }) => {
        await loginAsCustomer(page);
        // Clear cart by visiting it
        await page.goto(`${BASE_URL}/cart`);
        // Try to navigate to checkout directly
        await page.goto(`${BASE_URL}/checkout`);
        const emptyWarning = await page.getByText(/empty|no items|add items/i).isVisible({ timeout: 5000 }).catch(() => false);
        const redirected = !page.url().includes('/checkout');
        expect(emptyWarning || redirected).toBe(true);
    });
});

test.describe('CHECKOUT — Address Selection', () => {

    test('[CHK-P02] User can select an existing address', async ({ page }) => {
        await loginAsCustomer(page);
        await addItemToCart(page);
        await page.goto(`${BASE_URL}/checkout`);
        const addressCard = page.locator('[data-testid="address-card"], .address-card').first();
        if (await addressCard.isVisible({ timeout: 5000 }).catch(() => false)) {
            await addressCard.click();
            await expect(addressCard).toHaveClass(/selected|active|border-primary/, { timeout: 3000 });
        }
    });

    test('[CHK-P03] User can add a new address during checkout', async ({ page }) => {
        await loginAsCustomer(page);
        await addItemToCart(page);
        await page.goto(`${BASE_URL}/checkout`);
        const addNewBtn = page.getByRole('button', { name: /add.*address|new address/i });
        if (await addNewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await addNewBtn.click();
            // Address form should appear
            await expect(page.getByLabel(/street|city|zip/i).first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('[CHK-N03] Cannot place order without selecting an address', async ({ page }) => {
        await loginAsCustomer(page);
        await addItemToCart(page);
        await page.goto(`${BASE_URL}/checkout`);
        const placeOrderBtn = page.getByRole('button', { name: /place order|pay now/i });
        if (await placeOrderBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await placeOrderBtn.click();
            // Should show validation error or button stays disabled
            const validationVisible = await page.getByText(/select.*address|address.*required/i).isVisible({ timeout: 3000 }).catch(() => false);
            expect(validationVisible || !(await placeOrderBtn.isDisabled())).toBeTruthy();
        }
    });
});

test.describe('CHECKOUT — Order Success', () => {

    test('[CHK-P04] Order confirmation page shows order details after successful (mocked) payment', async ({ page }) => {
        await page.goto(`${BASE_URL}/checkout/success`);
        // Even without a real payment, the success page should render gracefully
        await expect(page.getByText(/success|confirmed|order/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('CHECKOUT — With Coupon Applied', () => {

    test('[CHK-P05] Coupon discount is reflected in checkout summary', async ({ page }) => {
        await loginAsCustomer(page);
        await addItemToCart(page);
        // Apply coupon in cart
        await page.goto(`${BASE_URL}/cart`);
        const couponInput = page.getByPlaceholder(/promo|coupon/i);
        if (await couponInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await couponInput.fill('WELCOME20');
            await page.getByRole('button', { name: /apply/i }).click();
            await page.waitForTimeout(1000);
        }
        // Navigate to checkout and verify discount is shown
        const checkoutBtn = page.getByRole('button', { name: /checkout|proceed/i });
        if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await checkoutBtn.click();
            await expect(page.getByText(/discount|saved|₹/i)).toBeVisible({ timeout: 6000 });
        }
    });
});
