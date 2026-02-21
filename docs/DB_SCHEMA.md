# Database Schema Document
## Project: ShopEase Ecommerce Platform

**Version:** 1.0  
**Date:** 2026-02-20

---

## 1. Entity Relationship Overview

```
users ──< addresses
users ──< orders ──< order_items >── products
users ── cart ──< cart_items >── products
users ──< wishlist_items >── products
users ──< reviews >── products
products >── categories
orders ── payments
products ──< product_images
```

---

## 2. Table Definitions

### 2.1 `users`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL DEFAULT 'CUSTOMER' |
| enabled | BOOLEAN | NOT NULL DEFAULT TRUE |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | |

---

### 2.2 `addresses`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users(id) |
| full_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(15) | NOT NULL |
| line1 | VARCHAR(255) | NOT NULL |
| line2 | VARCHAR(255) | |
| city | VARCHAR(100) | NOT NULL |
| state | VARCHAR(100) | NOT NULL |
| pincode | VARCHAR(10) | NOT NULL |
| country | VARCHAR(50) | NOT NULL DEFAULT 'India' |
| is_default | BOOLEAN | DEFAULT FALSE |

---

### 2.3 `categories`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| slug | VARCHAR(120) | UNIQUE, NOT NULL |
| description | TEXT | |
| image_url | VARCHAR(500) | |
| parent_id | BIGINT | FK → categories(id) (nullable, for subcategories) |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() |

---

### 2.4 `products`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| sku | VARCHAR(50) | UNIQUE, NOT NULL |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | |
| price | NUMERIC(12,2) | NOT NULL |
| sale_price | NUMERIC(12,2) | |
| stock_quantity | INT | NOT NULL DEFAULT 0 |
| category_id | BIGINT | FK → categories(id) |
| average_rating | NUMERIC(3,2) | DEFAULT 0 |
| review_count | INT | DEFAULT 0 |
| active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | |

**Indexes:**
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
```

---

### 2.5 `product_images`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| product_id | BIGINT | FK → products(id) ON DELETE CASCADE |
| image_url | VARCHAR(500) | NOT NULL |
| is_primary | BOOLEAN | DEFAULT FALSE |
| sort_order | INT | DEFAULT 0 |

---

### 2.6 `carts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | UNIQUE, FK → users(id) |
| updated_at | TIMESTAMP | |

---

### 2.7 `cart_items`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| cart_id | BIGINT | FK → carts(id) ON DELETE CASCADE |
| product_id | BIGINT | FK → products(id) |
| quantity | INT | NOT NULL DEFAULT 1 |
| UNIQUE | (cart_id, product_id) | |

---

### 2.8 `wishlist_items`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users(id) |
| product_id | BIGINT | FK → products(id) |
| added_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE | (user_id, product_id) | |

---

### 2.9 `orders`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users(id) |
| status | VARCHAR(20) | NOT NULL DEFAULT 'PENDING' |
| total_amount | NUMERIC(12,2) | NOT NULL |
| shipping_address_id | BIGINT | FK → addresses(id) |
| notes | TEXT | |
| ordered_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | |

**Order Status Enum:** `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Indexes:**
```sql
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

### 2.10 `order_items`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| order_id | BIGINT | FK → orders(id) ON DELETE CASCADE |
| product_id | BIGINT | FK → products(id) |
| product_name | VARCHAR(200) | NOT NULL (snapshot) |
| product_image_url | VARCHAR(500) | (snapshot) |
| quantity | INT | NOT NULL |
| unit_price | NUMERIC(12,2) | NOT NULL (snapshot) |

---

### 2.11 `payments`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| order_id | BIGINT | UNIQUE, FK → orders(id) |
| razorpay_order_id | VARCHAR(100) | |
| razorpay_payment_id | VARCHAR(100) | |
| status | VARCHAR(20) | DEFAULT 'PENDING' |
| amount | NUMERIC(12,2) | NOT NULL |
| currency | VARCHAR(5) | DEFAULT 'INR' |
| paid_at | TIMESTAMP | |

**Payment Status Enum:** `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`

---

### 2.12 `reviews`

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK → users(id) |
| product_id | BIGINT | FK → products(id) |
| order_id | BIGINT | FK → orders(id) (ensures purchase) |
| rating | INT | NOT NULL CHECK (rating BETWEEN 1 AND 5) |
| comment | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE | (user_id, product_id) | |

---

## 3. Flyway Migration Files

```
resources/db/migration/
├── V1__create_users_addresses.sql
├── V2__create_categories_products.sql
├── V3__create_cart_wishlist.sql
├── V4__create_orders_payments.sql
├── V5__create_reviews.sql
└── V6__seed_data.sql
```

---

## 4. Sample Seed Data (V6__seed_data.sql)

```sql
-- Admin User
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@shopease.com', '$2a$10$...bcrypt_hash...', 'ADMIN');

-- Sample Categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Phones, Laptops, Gadgets'),
('Clothing', 'clothing', 'Men & Women Fashion'),
('Books', 'books', 'Fiction, Non-Fiction, Academic'),
('Home & Kitchen', 'home-kitchen', 'Furniture, Appliances');

-- Sample Products
INSERT INTO products (sku, name, description, price, stock_quantity, category_id) VALUES
('ELEC-001', 'iPhone 15', 'Apple iPhone 15 128GB', 79999.00, 50, 1),
('CLTH-001', 'Classic White T-Shirt', 'Premium cotton t-shirt', 599.00, 200, 2),
('BOOK-001', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 699.00, 100, 3);
```
