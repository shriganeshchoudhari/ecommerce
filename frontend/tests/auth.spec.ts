import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Authentication
// Tests: Registration, Login, Logout, Profile, Guard Routes
// ============================================================

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('AUTH — Registration', () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;

    test('[AUTH-P01] New user can register with valid credentials', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByLabel(/name/i).fill('Test User');
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /register|create account/i }).click();
        // After register, user should be redirected (to home or login)
        await expect(page).not.toHaveURL(/\/register/);
    });

    test('[AUTH-N01] Registration fails with duplicate email', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByLabel(/name/i).fill('Duplicate User');
        await page.getByLabel(/email/i).fill('admin_test@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /register|create account/i }).click();
        await expect(page.getByText(/email.*already|already.*use/i)).toBeVisible({ timeout: 5000 });
    });

    test('[AUTH-N02] Registration fails with short password', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);
        await page.getByLabel(/name/i).fill('Short Pass User');
        await page.getByLabel(/email/i).fill(`short_${Date.now()}@example.com`);
        await page.getByLabel(/password/i).fill('123');
        await page.getByRole('button', { name: /register|create account/i }).click();
        // Should show a validation error or stay on the same page
        await expect(page).toHaveURL(/\/register/);
    });
});

test.describe('AUTH — Login', () => {

    test('[AUTH-P02] Customer can login with valid credentials', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await expect(page).not.toHaveURL(/\/login/);
        // Navbar should show user info or logout button
        await expect(page.getByRole('button', { name: /user menu/i })).toBeVisible({ timeout: 5000 });
    });

    test('[AUTH-P03] Admin can login and see Admin link in nav', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('admin_test@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.getByRole('link', { name: /admin/i })).toBeVisible({ timeout: 5000 });
    });

    test('[AUTH-N03] Login fails with wrong password', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('admin_test@shopease.com');
        await page.getByLabel(/password/i).fill('WrongPassword!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await expect(page.getByText(/invalid|incorrect|credentials|wrong/i)).toBeVisible({ timeout: 5000 });
    });

    test('[AUTH-N04] Login fails with non-existent email', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('nobody@nowhere.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await expect(page.getByText(/invalid|not found|credentials/i)).toBeVisible({ timeout: 5000 });
    });
});

test.describe('AUTH — Guard Routes', () => {

    test('[AUTH-N05] Unauthenticated user is redirected from /profile', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile`);
        await expect(page).toHaveURL(/\/login/);
    });

    test('[AUTH-N06] Unauthenticated user is redirected from /wishlist', async ({ page }) => {
        await page.goto(`${BASE_URL}/wishlist`);
        await expect(page).toHaveURL(/\/login/);
    });

    test('[AUTH-N07] Non-admin user cannot access /admin', async ({ page }) => {
        // Login as customer
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await page.goto(`${BASE_URL}/admin`);
        // Should be redirected or shown forbidden
        await expect(page).not.toHaveURL(`${BASE_URL}/admin`);
    });
});

test.describe('AUTH — Logout', () => {

    test('[AUTH-P04] User can logout', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await page.waitForURL(/\//);
        // Open user dropdown and click logout
        await page.getByRole('button', { name: /user menu/i }).click();
        await page.getByRole('menuitem', { name: /log out|logout|sign out/i }).click();
        // Should be redirected to home and show login link
        await expect(page.getByRole('link', { name: /login|sign in/i })).toBeVisible({ timeout: 5000 });
    });
});
