# ShopEase E2E Test Execution & Failure Analysis

**Date:** 2026-02-22  
**Test Runner:** Playwright (Chromium)  
**Total Tests:** 76  
**Status:** 38 Passed ✅ / 38 Failed ❌

---

## 📊 Artifacts Generated
1. **Excel Report:** `frontend/tests/test-results/ShopEase_TestReport.xlsx` (Contains detailed PASS/FAIL status, execution times, and error messages for every single test case).
2. **Screenshots & Traces:** Enabled in `playwright.config.ts`. All failures have captured screenshots accessible via the Playwright HTML reporter (`npx playwright show-report`).

---

## 🔍 Failure Analysis

After running the full suite and analyzing the error logs, the failures can be grouped into the following root causes:

### 1. Locator Mismatches (Authentication)
* **Failed Tests:** `[AUTH-P02] Customer can login`, `[AUTH-P03] Admin can login`, `[AUTH-P04] User can logout`
* **Root Cause:** The tests were asserting that the navbar would contain text like "Account" or "Profile" (`toContainText(/cart|account|profile/i)`). However, the actual application UI uses a minimalist icon-based layout (a User Icon button with the accessible name **"User menu"**). 
* **Impact:** High. Because the assertion failed, the test runner timed out, and any interactions with the logout dropdown failed.

### 2. Cascading Timeout Failures (Cart, Admin, Profile)
* **Failed Tests:** Nearly all positive test cases in `CART`, `ADMIN`, and `PROFILE` modules (e.g., `[CART-P02]`, `[ADM-P03]`, `[PROF-P06]`).
* **Root Cause:** All of these tests rely on the `loginAsAdmin` or user login helper function. While the login itself succeeds functionally, the tests were timing out waiting for specific UI elements to appear post-login (due to similar locator mismatches on the tabs or layout). Since the UI navigation timed out, Playwright aborted the tests.
* **Resolution Required:** We must patch the UI locators in `cart.spec.ts`, `admin.spec.ts`, and `profile.spec.ts` to match the exact Shadcn UI classes and text used in the latest frontend iteration.

### 3. Search & Product Empty States
* **Failed Tests:** `[PROD-P02] Search returns filtered results`, `[PROD-N01] Search with no results`
* **Root Cause:** The search input was targeted using `getByPlaceholder(/search/i)`, but the responsive Navbar renders *two* search inputs (one for desktop, one for mobile drawer). This causes a "strict mode violation" in Playwright because multiple elements match the locator.
* **Resolution:** Update the locator in `products.spec.ts` to `.first().fill()` or target the specific desktop visible input.

---

## 🛠️ Fixes Applied & Next Steps

1. **Fixed Excel Reporter:** The custom JS reporter was updated to correctly retrieve the Module name from the test tree instead of defaulting to the `chromium` project name.
2. **Enabled Screenshots:** Updated `playwright.config.ts` to capture screenshots and traces across all tests automatically.
3. **Fixed Auth Locators:** Updated `auth.spec.ts` to use `page.getByRole('button', { name: /user menu/i })` and `page.getByRole('menuitem', { name: /log out/i })`.
4. **Pending Fixes:** Next step is to fix the strict mode violation in the search tests and patch the tab locators in the Admin/Profile specs.
