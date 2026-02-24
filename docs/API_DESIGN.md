# API Design Document
## Project: ShopEase Ecommerce Platform

**Version:** 1.0  
**Date:** 2026-02-20  
**Base URL:** `http://localhost:8080/api/v1`

---

## 1. Conventions

- All requests/responses use `application/json`
- Auth required endpoints need: `Authorization: Bearer <accessToken>`
- Date format: ISO 8601 (`2026-02-20T15:30:00Z`)
- Pagination: `?page=0&size=20&sort=createdAt,desc`
- Error format:
```json
{
  "timestamp": "2026-02-20T15:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 99",
  "path": "/api/v1/products/99"
}
```

---

## 2. Authentication APIs (`/auth`)

### POST `/auth/register`
Register a new customer account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```
**Response `201`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

---

### POST `/auth/login`
**Request:**
```json
{ "email": "john@example.com", "password": "SecurePass@123" }
```
**Response `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

---

### POST `/auth/refresh`
**Request:**
```json
{ "refreshToken": "eyJhbGci..." }
```
**Response `200`:** New `accessToken`.

---

### POST `/auth/logout`
🔒 Auth Required. Invalidates refresh token.

---

### GET `/auth/oauth2/google`
Redirects to Google OAuth2 login page. Upon success, redirects back to frontend with the standard `accessToken` and `refreshToken`.

---

## 3. Product APIs (`/products`)

### GET `/products`
List all active products with pagination & filters.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| page | int | Page number (default: 0) |
| size | int | Page size (default: 20) |
| category | Long | Filter by category ID |
| minPrice | Double | Min price filter |
| maxPrice | Double | Max price filter |
| search | String | Full-text search |
| sort | String | e.g. `price,asc` |

**Response `200`:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "iPhone 15",
      "price": 79999.00,
      "salePrice": null,
      "thumbnailUrl": "https://cdn.../iphone15.jpg",
      "averageRating": 4.5,
      "reviewCount": 120,
      "inStock": true
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0
}
```

---

### GET `/products/{id}`
Get single product detail.

**Response `200`:**
```json
{
  "id": 1,
  "sku": "ELEC-001",
  "name": "iPhone 15",
  "description": "Apple iPhone 15 128GB...",
  "price": 79999.00,
  "salePrice": null,
  "stockQuantity": 50,
  "category": { "id": 1, "name": "Electronics" },
  "images": [
    { "url": "https://...", "isPrimary": true }
  ],
  "averageRating": 4.5,
  "reviewCount": 120,
  "variants": [
    { "id": 101, "name": "Color Red", "skuOverride": "ELEC-001-RED", "priceOverride": null, "stockQuantity": 20 }
  ]
}
```

---

### GET `/products/{id}/recommendations`
Get related products for cross-selling.

**Response `200`:** Returns a standard Product List (same format as `/products`).

---

### POST `/admin/products` 🔒 ADMIN
Create a new product.

**Request:**
```json
{
  "sku": "ELEC-002",
  "name": "Samsung Galaxy S24",
  "description": "...",
  "price": 69999.00,
  "stockQuantity": 75,
  "categoryId": 1
}
```

---

### PUT `/admin/products/{id}` 🔒 ADMIN
Update product details.

### DELETE `/admin/products/{id}` 🔒 ADMIN
Soft-delete a product (sets `active = false`).

---

## 4. Category APIs (`/categories`)

### GET `/categories`
Returns full category tree.
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "imageUrl": "https://...",
    "subcategories": [
      { "id": 5, "name": "Phones", "slug": "phones" }
    ]
  }
]
```

### POST `/admin/categories` 🔒 ADMIN
### PUT `/admin/categories/{id}` 🔒 ADMIN
### DELETE `/admin/categories/{id}` 🔒 ADMIN

---

## 5. Cart APIs (`/cart`) 🔒 Auth Required

### GET `/cart`
Get current user's cart.
```json
{
  "id": 1,
  "items": [
    {
      "id": 10,
      "product": { "id": 1, "name": "iPhone 15", "price": 79999.00, "thumbnailUrl": "..." },
      "quantity": 2,
      "subtotal": 159998.00
    }
  ],
  "totalAmount": 159998.00
}
```

### POST `/cart/items`
Add item to cart.
```json
{ "productId": 1, "quantity": 2 }
```

### PUT `/cart/items/{itemId}`
Update quantity.
```json
{ "quantity": 3 }
```

### DELETE `/cart/items/{itemId}`
Remove item from cart.

### DELETE `/cart`
Clear entire cart.

### POST `/cart/coupon`
Apply a promo code to the cart.
```json
{ "code": "SUMMER10" }
```

### DELETE `/cart/coupon`
Remove applied promo code.

---

## 6. Wishlist APIs (`/wishlist`) 🔒 Auth Required

### GET `/wishlist`
### POST `/wishlist`  →  `{ "productId": 1 }`
### DELETE `/wishlist/{productId}`

---

## 7. Order APIs (`/orders`) 🔒 Auth Required

### POST `/orders`
Place an order from cart.
```json
{
  "addressId": 5,
  "notes": "Leave at door"
}
```
**Response `201`:**
```json
{
  "id": 100,
  "status": "PENDING",
  "totalAmount": 159998.00,
  "paymentOrderId": "order_xyz123"
}
```

### GET `/orders`
List user's orders (paginated).

### GET `/orders/{id}`
Get order detail with items.

### PUT `/orders/{id}/cancel`
Cancel an order (only if PENDING or CONFIRMED).

---

## 8. Payment APIs (`/payments`) 🔒 Auth Required

### POST `/payments/initiate`
```json
{ "orderId": 100 }
```
Returns Razorpay order details for frontend Razorpay SDK.

### POST `/payments/verify`
Verify payment after Razorpay callback.
```json
{
  "orderId": 100,
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash"
}
```

---

## 9. Review APIs (`/reviews`) 🔒 Auth Required (submit) / Public (read)

### GET `/reviews/product/{productId}`
Returns all approved reviews for a product (public).

**Response `200`:**
```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "Excellent product!",
    "createdAt": "2026-02-20T10:00:00Z",
    "user": { "name": "John Doe" }
  }
]
```

### POST `/reviews` 🔒 Auth Required (must have purchased product)
Submit a product review.
```json
{
  "productId": 1,
  "rating": 5,
  "comment": "Excellent product! Highly recommended."
}
```
**Response `201`:** Created review object.

---

## 10. Product Variants API (`/products/{id}/variants`) — Public

### GET `/products/{id}/variants`
Returns all active size/color variants for a product.

**Response `200`:**
```json
[
  {
    "id": 1,
    "size": "M",
    "color": "Black",
    "skuSuffix": "M-BLK",
    "stockQuantity": 55,
    "priceOverride": null,
    "active": true
  }
]
```

---

## 11. Recommendation API (`/products/{id}/recommendations`) — Public

### GET `/products/{id}/recommendations`
Returns up to 6 products in the same category, excluding the current product.

**Response `200`:** Array of `Product` objects.

---

## 12. User Profile APIs (`/users/me`) 🔒 Auth Required

### GET `/users/me`
### PUT `/users/me`
```json
{ "name": "John Updated" }
```

### GET `/addresses`  — List saved addresses
### POST `/addresses` — Create a new address
```json
{
  "streetName": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "zipCode": "560001",
  "country": "India",
  "isDefault": true
}
```
### PUT `/addresses/{id}` — Update an address
### DELETE `/addresses/{id}` — Delete an address

---

## 13. Coupon APIs (`/admin/coupons`) 🔒 ADMIN Only

### GET `/admin/coupons`
### POST `/admin/coupons`
```json
{
  "code": "SUMMER10",
  "discountType": "PERCENTAGE",
  "discountValue": 10.00,
  "minOrderAmount": 500.00,
  "validFrom": "2026-06-01T00:00:00Z",
  "validUntil": "2026-08-31T23:59:59Z"
}
```
`discountType`: `PERCENTAGE` | `FIXED`

### DELETE `/admin/coupons/{id}`

---

## 14. Admin APIs (`/admin`) 🔒 ADMIN Only

### GET `/admin/users`
Returns all registered users.

**Response `200`:** Array of `User` objects (id, name, email, role, enabled, createdAt).

### GET `/admin/orders?page=0&size=20`
All orders with pagination.

### PUT `/admin/orders/{id}/status`
Update order status.
```json
{ "status": "SHIPPED" }
```
`status` enum: `PENDING` | `CONFIRMED` | `SHIPPED` | `DELIVERED` | `CANCELLED`

### POST `/admin/products` — Create product
### PUT `/admin/products/{id}` — Update product
### DELETE `/admin/products/{id}` — Delete product

### POST `/admin/categories` — Create category
### PUT `/admin/categories/{id}` — Update category
### DELETE `/admin/categories/{id}` — Delete category

### GET `/admin/dashboard/stats`
```json
{
  "totalUsers": 1200,
  "totalOrders": 450,
  "totalRevenue": 1500000
}
```

---

## 15. System Health & Actuator

### GET `/actuator/health`
```json
{ "status": "UP" }
```

### GET `/actuator/info`
Application version and build information.

---

## 16. AI Assistant APIs (`/ai`) 🔒 Auth Required

### POST `/ai/chat`
Send a message to the AI assistant.
```json
{
  "conversationId": 1, // Optional, omitt to start new
  "message": "Do you have any gaming laptops?"
}
```
**Response `200`:**
```json
{
  "conversationId": 1,
  "response": "Yes, we have several gaming laptops in stock! For example..."
}
```

### GET `/ai/conversations`
List all conversations for the authenticated user.
```json
[
  { "id": 1, "title": "Gaming Laptops", "updatedAt": "2026-02-24T10:00:00Z" }
]
```

### GET `/ai/conversations/{id}`
Get full message history for a conversation.
```json
{
  "id": 1,
  "title": "Gaming Laptops",
  "messages": [
    { "role": "USER", "content": "..." },
    { "role": "ASSISTANT", "content": "..." }
  ]
}
```

### DELETE `/ai/conversations/{id}`
Delete a conversation.

---

## Error Reference

| HTTP Status | When Thrown |
|---|---|
| `400 Bad Request` | Invalid request body, missing required fields, duplicate coupon code, empty cart |
| `401 Unauthorized` | Missing or expired JWT token |
| `403 Forbidden` | Valid token but insufficient role (e.g. CUSTOMER on ADMIN endpoint) |
| `404 Not Found` | Resource (product, order, address, coupon) not found |
| `409 Conflict` | Duplicate email on registration, duplicate coupon code |
| `500 Internal Server Error` | Unhandled server exception |

---

*Last updated: 2026-02-22 — Covers Phase 8 (Wishlist, Reviews, Admin UI) and Phase 9 (Variants, Recommendations, Email)*
