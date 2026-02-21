# ShopEase — E2E Test Plan

**Tool:** Playwright (TypeScript)  
**Frontend URL:** `http://localhost:3000`  
**Backend URL:** `http://localhost:8080`  
**Last Updated:** 2026-02-22

---

## Prerequisites

```bash
# Install Playwright and browsers once
cd frontend
npm install
npx playwright install

# Backend must be running with seed data (V1–V9 Flyway migrations applied)
# mvn spring-boot:run  (in /backend)

# Frontend must be running
# npm run dev           (in /frontend)
```

---

## Test Data (Seeded via V8/V9 Migrations)

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | `admin_test@shopease.com` | `Password123!` | ADMIN |
| Customer | `testapi_user@shopease.com` | `Password123!` | CUSTOMER |

| Coupon | Type | Value | Min Order |
|---|---|---|---|
| `WELCOME20` | PERCENTAGE | 20% | None |
| `SAVE500`   | FIXED | ₹500 | ₹2000 |
| `NEWUSER15` | PERCENTAGE | 15% | None |

---

## Spec Files & Test IDs

### Module 1 — Auth [`tests/auth.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/auth.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| AUTH-P01 | Register with valid data | ✅ Positive | Redirect away from /register |
| AUTH-P02 | Login as customer | ✅ Positive | Redirected, nav shows Cart/Account |
| AUTH-P03 | Login as admin — sees Admin link | ✅ Positive | Admin link visible in navbar |
| AUTH-P04 | User can logout | ✅ Positive | Login link visible after logout |
| AUTH-N01 | Register with duplicate email | ❌ Negative | Error message shown |
| AUTH-N02 | Register with short password | ❌ Negative | Stay on /register page |
| AUTH-N03 | Login with wrong password | ❌ Negative | Error message shown |
| AUTH-N04 | Login with non-existent email | ❌ Negative | Error message shown |
| AUTH-N05 | Unauthenticated → /profile redirects | ❌ Negative | URL → /login |
| AUTH-N06 | Unauthenticated → /wishlist redirects | ❌ Negative | URL → /login |
| AUTH-N07 | Customer cannot access /admin | ❌ Negative | Not on /admin URL |

---

### Module 2 — Products [`tests/products.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/products.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| PROD-P01 | Products page loads with cards | ✅ Positive | Cards visible |
| PROD-P02 | Search returns filtered results | ✅ Positive | Results visible |
| PROD-P03 | Category filter narrows products | ✅ Positive | Products shown |
| PROD-P04 | Product detail: name, price, Add to Cart | ✅ Positive | All elements visible |
| PROD-P05 | Gallery image click | ✅ Positive | No crash |
| PROD-P06 | Quantity selector increments/decrements | ✅ Positive | Shows "2" after +2-1 |
| PROD-P07 | Variant chips appear for products with variants | ✅ Positive | Chips visible if variants exist |
| PROD-P08 | Color chip click shows selection | ✅ Positive | Selected state changes |
| PROD-P09 | Reviews section visible | ✅ Positive | Reviews heading shown |
| PROD-P10 | Unauthenticated user — no "Write a Review" form | ✅ Positive | Form NOT visible |
| PROD-P11 | Logged-in user sees write review form | ✅ Positive | Form IS visible |
| PROD-P12 | Recommendations carousel appears | ✅ Positive | Section visible if data exists |
| PROD-N01 | Search with 0 results shows empty state | ❌ Negative | Empty state message |
| PROD-N02 | Non-existent product shows 404 state | ❌ Negative | "Not Found" message |

---

### Module 3 — Cart [`tests/cart.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/cart.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| CART-P01 | Add product to cart from detail page | ✅ Positive | Toast: "added to cart" |
| CART-P02 | Cart badge updates in navbar | ✅ Positive | Badge shows count |
| CART-P03 | Cart page shows added items | ✅ Positive | Price/total visible |
| CART-P04 | Quantity can be increased in cart | ✅ Positive | Shows "2" |
| CART-P05 | Item can be removed from cart | ✅ Positive | Empty state or reduced items |
| CART-P06 | Valid coupon applies discount | ✅ Positive | "Discount/Saved" message |
| CART-P07 | Applied coupon can be removed | ✅ Positive | Removal confirmation |
| CART-N01 | Unauthenticated add-to-cart | ❌ Negative | Login redirect or toast |
| CART-N02 | Empty cart shows empty state | ❌ Negative | Empty state message |
| CART-N03 | Invalid coupon code shows error | ❌ Negative | Error message |

---

### Module 4 — Checkout [`tests/checkout.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/checkout.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| CHK-P01 | Checkout page loads with items in cart | ✅ Positive | Address selection shown |
| CHK-P02 | User can select existing address | ✅ Positive | Address highlighted |
| CHK-P03 | User can add new address at checkout | ✅ Positive | Address form appears |
| CHK-P04 | Order success page renders | ✅ Positive | "Confirmed" message visible |
| CHK-P05 | Coupon discount shown in checkout summary | ✅ Positive | Discount amount shown |
| CHK-N01 | Unauthenticated → /checkout redirects | ❌ Negative | URL → /login |
| CHK-N02 | Empty cart → checkout shows warning or redirects | ❌ Negative | Warning/redirect |
| CHK-N03 | Place order without address selected fails | ❌ Negative | Validation error or button disabled |

---

### Module 5 — Wishlist [`tests/wishlist.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/wishlist.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| WISH-P01 | Add product to wishlist via heart button | ✅ Positive | Toast: "saved" |
| WISH-P02 | Wishlist page shows saved products | ✅ Positive | Products visible |
| WISH-P03 | Remove product from wishlist page | ✅ Positive | Removed or empty state |
| WISH-P04 | Add to Cart from wishlist page | ✅ Positive | Toast: "added" |
| WISH-P05 | Heart icon toggles state on click | ✅ Positive | Icon changes |
| WISH-N01 | Unauthenticated → /wishlist redirects | ❌ Negative | URL → /login |
| WISH-N02 | Empty wishlist shows empty state | ❌ Negative | Heading still visible |

---

### Module 6 — Admin [`tests/admin.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/admin.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| ADM-P01 | Admin can access dashboard | ✅ Positive | URL = /admin |
| ADM-P02 | Dashboard shows stats | ✅ Positive | "users/orders/revenue" text |
| ADM-P03 | Orders tab shows orders | ✅ Positive | Order table visible |
| ADM-P04 | Admin can update order status | ✅ Positive | "shipped/updated" confirmation |
| ADM-P05 | Coupons tab shows coupons | ✅ Positive | Table with code/discount |
| ADM-P06 | Admin can create coupon | ✅ Positive | Success toast |
| ADM-P07 | Admin can delete coupon | ✅ Positive | Deleted confirmation |
| ADM-P08 | Users tab shows all users | ✅ Positive | Email/role columns visible |
| ADM-P09 | At least one user shown | ✅ Positive | admin/customer role visible |
| ADM-P10 | Products tab shows products list | ✅ Positive | Product table visible |
| ADM-P11 | Admin can create product | ✅ Positive | Success toast |
| ADM-N01 | Unauthenticated → /admin redirects | ❌ Negative | Not on /admin URL |
| ADM-N02 | Customer → /admin blocked | ❌ Negative | Not on /admin URL |
| ADM-N03 | Duplicate coupon code shows error | ❌ Negative | Error message shown |

---

### Module 7 — Profile [`tests/profile.spec.ts`](file:///f:/DEVOPS/ecommerce/frontend/tests/profile.spec.ts)

| ID | Scenario | Type | Expected |
|---|---|---|---|
| PROF-P01 | Profile page shows user name/email | ✅ Positive | User info visible |
| PROF-P02 | "My Account" heading present | ✅ Positive | Heading visible |
| PROF-P03 | Orders tab shows history or empty state | ✅ Positive | Orders or empty msg |
| PROF-P04 | Order status stepper visible on orders | ✅ Positive | PENDING/SHIPPED etc. |
| PROF-P05 | Cancelled orders show CANCELLED badge | ✅ Positive | Badge (if cancelled) |
| PROF-P06 | Addresses tab shows addresses | ✅ Positive | address/city text |
| PROF-P07 | Wishlist link visible in sidebar | ✅ Positive | Link visible |
| PROF-P08 | Wishlist link navigates to /wishlist | ✅ Positive | URL = /wishlist |
| PROF-P09 | User can sign out from profile | ✅ Positive | Login link visible |
| PROF-N01 | Unauthenticated → /profile redirects | ❌ Negative | URL → /login |

---

## Execution Commands

```bash
cd frontend

# Run ALL E2E tests (headless)
npx playwright test

# Run specific module
npx playwright test tests/auth.spec.ts
npx playwright test tests/products.spec.ts
npx playwright test tests/cart.spec.ts
npx playwright test tests/checkout.spec.ts
npx playwright test tests/wishlist.spec.ts
npx playwright test tests/admin.spec.ts
npx playwright test tests/profile.spec.ts

# Run with browser visible (headed mode — useful for debugging)
npx playwright test --headed

# Run with interactive UI mode (best for development)
npx playwright test --ui

# Run only negative tests (filter by title)
npx playwright test -g "Negative|AUTH-N|PROD-N|CART-N|CHK-N|WISH-N|ADM-N|PROF-N"

# Show HTML report after a run
npx playwright show-report
```

---

## Test Suite Summary

| Module | Positive | Negative | Total |
|---|---|---|---|
| Auth | 4 | 7 | 11 |
| Products | 12 | 2 | 14 |
| Cart | 7 | 3 | 10 |
| Checkout | 5 | 3 | 8 |
| Wishlist | 5 | 2 | 7 |
| Admin | 11 | 3 | 14 |
| Profile | 9 | 1 | 10 |
| **Total** | **53** | **21** | **74** |

---

## Notes

- **Payment tests** (Razorpay) are excluded from E2E because they require a real payment gateway. Use the API test file (`api.http`) and Razorpay test credentials to verify payment flow manually.
- **Email tests** are not covered by Playwright. Use a tool like [Mailhog](https://github.com/mailhog/MailHog) or [Mailtrap](https://mailtrap.io) as a dev SMTP server to capture and verify emails.
- Tests are designed to be **resilient** — they use soft assertions for optional UI elements that depend on seed data, so no test fails spuriously on a fresh DB.
- All tests require the `npm run dev` (frontend) and `mvn spring-boot:run` (backend) to be running.
