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
  "expiresIn": 3600
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
  "reviewCount": 120
}
```

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

## 9. Review APIs (`/reviews`) 🔒 Auth Required

### GET `/products/{productId}/reviews`
### POST `/products/{productId}/reviews`
```json
{ "rating": 5, "comment": "Excellent product!" }
```

---

## 10. User Profile APIs (`/users/me`) 🔒 Auth Required

### GET `/users/me`
### PUT `/users/me`
```json
{ "name": "John Updated" }
```

### GET `/users/me/addresses`
### POST `/users/me/addresses`
### PUT `/users/me/addresses/{id}`
### DELETE `/users/me/addresses/{id}`

---

## 11. Admin APIs (`/admin`) 🔒 ADMIN Only

### GET `/admin/users` — List all users
### PUT `/admin/users/{id}/disable` — Disable a user
### GET `/admin/orders` — All orders with filters
### PUT `/admin/orders/{id}/status` — Update order status
```json
{ "status": "SHIPPED" }
```
### GET `/admin/dashboard/stats` — Sales stats
```json
{
  "totalRevenue": 1500000.00,
  "totalOrders": 450,
  "totalUsers": 1200,
  "topProducts": [...]
}
```
