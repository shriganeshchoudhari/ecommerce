# ShopEase — Comprehensive API Test Cases

This document maps the extensive API test scenarios located in the REST Client file (`API Test/api.http`). Playwright E2E and component API tests represent automated validations of these flows.

## 1. Authentication (`/api/v1/auth` & `/api/v1/users`)
| ID | Scenario | Type | Expected |
|---|---|---|---|
| AUTH-01 | Register a new customer | ✅ Positive | 200 OK |
| AUTH-02 | Login as Admin | ✅ Positive | 200 OK (+ Token) |
| AUTH-03 | Login as Customer | ✅ Positive | 200 OK (+ Token) |
| AUTH-04 | Get authenticated user profile (`/users/me`) | ✅ Positive | 200 OK |
| AUTH-05 | Login with wrong password | ❌ Negative | 401 Unauthorized |
| AUTH-06 | Register with duplicate email | ❌ Negative | 400 Bad Request |
| AUTH-07 | Access protected route (`/cart`) without token | ❌ Negative | 401 Unauthorized |

## 2. Products & Categories
| ID | Scenario | Type | Expected |
|---|---|---|---|
| PROD-01 | Get all categories | ✅ Positive | 200 OK |
| PROD-02 | Get paginated products | ✅ Positive | 200 OK |
| PROD-03 | Search products by query | ✅ Positive | 200 OK |
| PROD-04 | Filter products by category | ✅ Positive | 200 OK |
| PROD-05 | Filter products by price range | ✅ Positive | 200 OK |
| PROD-06 | Get single product by ID | ✅ Positive | 200 OK |
| PROD-07 | Get non-existent product | ❌ Negative | 404 Not Found |
| PROD-08 | Get product variants | ✅ Positive | 200 OK |
| PROD-09 | Get product recommendations | ✅ Positive | 200 OK |

## 3. Cart (`/api/v1/cart`)
| ID | Scenario | Type | Expected |
|---|---|---|---|
| CART-01 | Get current user's cart | ✅ Positive | 200 OK |
| CART-02 | Add item to cart | ✅ Positive | 200 OK |
| CART-03 | Update item quantity | ✅ Positive | 200 OK |
| CART-04 | Remove item from cart | ✅ Positive | 200 OK |
| CART-05 | Apply a coupon | ✅ Positive | 200 OK |
| CART-06 | Remove coupon | ✅ Positive | 200 OK |
| CART-07 | Clear entire cart | ✅ Positive | 200 OK |
| CART-08 | Add item without auth | ❌ Negative | 401 Unauthorized |
| CART-09 | Add non-existent product | ❌ Negative | 404 Not Found |
| CART-10 | Apply invalid coupon code | ❌ Negative | 400 Bad Request |

## 4. Wishlist, Reviews & Addresses
| ID | Scenario | Type | Expected |
|---|---|---|---|
| WISH-01 | Get user's wishlist | ✅ Positive | 200 OK |
| WISH-02 | Add product to wishlist | ✅ Positive | 200 OK |
| WISH-03 | Remove product from wishlist | ✅ Positive | 200 OK |
| WISH-04 | Add wishlist unauth | ❌ Negative | 401 Unauthorized |
| REV-02 | Submit a product review | ✅ Positive | 200 OK |
| REV-04 | Submit review with invalid rating (0) | ❌ Negative | 400 Bad Request |
| ADDR-02 | Create a new shipping address | ✅ Positive | 200 OK |

## 5. Admin & Dashboard (`/api/v1/admin`)
| ID | Scenario | Type | Expected |
|---|---|---|---|
| ADM-ORD-01 | Get all orders | ✅ Positive | 200 OK |
| ADM-PROD-01| Create a new product | ✅ Positive | 200 OK |
| ADM-PROD-04| Create product as non-admin | ❌ Negative | 403 Forbidden |
| ADM-CPN-02 | Create Percentage Coupon | ✅ Positive | 200 OK |
| ADM-CPN-05 | Create duplicate coupon | ❌ Negative | 400 Bad Request |
| ADM-STAT-01| Get dashboard admin stats | ✅ Positive | 200 OK |

## 6. AI Assistant (`/api/v1/ai`)
| ID | Scenario | Type | Expected |
|---|---|---|---|
| AI-01 | Chat with AI Assistant | ✅ Positive | 200 OK |
| AI-02 | Get user's AI conversations | ✅ Positive | 200 OK |
| AI-03 | Chat missing message body | ❌ Negative | 400 Bad Request |
| AI-04 | Access AI without token | ❌ Negative | 401 Unauthorized |

---

## Execution Instructions

To automatically execute the entire API test suite with automated assertions, you can run the provided script from the project root. This uses [Newman](https://learning.postman.com/docs/collections/using-newman/command-line-integration-with-newman/) and outputs a rich HTML report (`docs/ShopEase_API_Test_Report.html`).

**Windows:**
```cmd
run_postman_tests.bat
```

**macOS/Linux:**
```bash
chmod +x run_postman_tests.sh
./run_postman_tests.sh
```
