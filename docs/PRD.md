# Product Requirements Document (PRD)
## Project: ShopEase - Full-Stack Ecommerce Website

**Version:** 1.0  
**Date:** 2026-02-20  
**Author:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

ShopEase is a modern, full-featured ecommerce platform that allows customers to browse products, manage carts, and place orders securely. The platform includes a customer-facing storefront, an admin dashboard for inventory and order management, and a robust backend API.

---

## 2. Goals & Objectives

| Goal | Description |
|------|-------------|
| **G1** | Build a scalable, cloud-ready ecommerce platform |
| **G2** | Deliver a seamless and responsive shopping experience |
| **G3** | Provide a secure payment and checkout process |
| **G4** | Enable efficient product and inventory management |
| **G5** | Support multi-role access (Customer, Admin) |

---

## 3. Target Users

### 3.1 Customer
- End user who browses, searches, and purchases products.
- Can manage their profile, orders, wishlist, and cart.

### 3.2 Admin
- Manages products, categories, inventory, and orders.
- Views sales analytics and manages users.

---

## 4. Scope

### In Scope
- User registration and authentication (JWT-based)
- OAuth2 Social Login (Google)
- Product browsing, search, filtering, and recommendations
- Product detail pages with image galleries and variants (Size/Color)
- Shopping cart, promo codes, and wishlist management
- Checkout with address management
- Payment integration (Razorpay / Stripe)
- Order tracking and history
- Admin panel (product, category, order, user, coupon management)
- Product reviews and ratings
- Email notifications (registration, order confirmation)
- AI Shopping Assistant (local LLM via Ollama)

### Out of Scope (v1)
- Multi-vendor marketplace
- Mobile app (iOS/Android)
- Subscription/recurring billing
- Loyalty points system

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization
| ID | Requirement |
|----|-------------|
| FR-AUTH-1 | Users can register with name, email, and password |
| FR-AUTH-2 | Users can log in and receive a JWT access token |
| FR-AUTH-3 | Passwords are hashed using BCrypt |
| FR-AUTH-4 | JWT tokens expire after 1 hour; refresh tokens last 7 days |
| FR-AUTH-5 | Admin role can access admin-only endpoints |
| FR-AUTH-6 | Users can reset password via email OTP |
| FR-AUTH-7 | Users can seamlessly register/login via OAuth2 Google |

### 5.2 Product Management
| ID | Requirement |
|----|-------------|
| FR-PROD-1 | Products have: name, description, price, stock, category, images, SKU |
| FR-PROD-2 | Products can be filtered by category, price range, rating |
| FR-PROD-3 | Products can be searched by name and description (full-text search) |
| FR-PROD-4 | Products have multiple images (primary + gallery) |
| FR-PROD-5 | Products support variants (Size, Color, Material) with independent stock/price |
| FR-PROD-6 | Admin can create, update, and delete products, variants, and coupons |
| FR-PROD-7 | Stock levels update automatically on order placement |
| FR-PROD-8 | System provides product recommendations (related products) on detail pages |

### 5.3 Shopping Cart
| ID | Requirement |
|----|-------------|
| FR-CART-1 | Authenticated users can add/remove/update items in cart |
| FR-CART-2 | Cart persists across sessions (database-backed) |
| FR-CART-3 | Cart shows subtotal, quantity per item, and total |
| FR-CART-4 | Guest cart merges with user cart on login |
| FR-CART-5 | Users can apply a valid promo code to discount the cart total |

### 5.4 Wishlist
| ID | Requirement |
|----|-------------|
| FR-WISH-1 | Users can add/remove products to/from wishlist |
| FR-WISH-2 | Users can move items from wishlist to cart |

### 5.5 Checkout & Orders
| ID | Requirement |
|----|-------------|
| FR-ORD-1 | Users can save multiple shipping addresses |
| FR-ORD-2 | Checkout displays order summary before payment |
| FR-ORD-3 | Orders are created upon successful payment |
| FR-ORD-4 | Order statuses: PENDING → CONFIRMED → SHIPPED → DELIVERED → CANCELLED |
| FR-ORD-5 | Users receive email notification on order confirmation |
| FR-ORD-6 | Users can cancel orders in PENDING/CONFIRMED status |
| FR-ORD-7 | Users can view order history and details |

### 5.6 Payment
| ID | Requirement |
|----|-------------|
| FR-PAY-1 | Payment via Razorpay (primary) or Stripe |
| FR-PAY-2 | Successful payment triggers order creation |
| FR-PAY-3 | Failed payment returns user to checkout with error |
| FR-PAY-4 | Payment details are stored securely (no raw card data) |

### 5.7 Reviews & Ratings
| ID | Requirement |
|----|-------------|
| FR-REV-1 | Only users who purchased a product can review it |
| FR-REV-2 | Reviews have a rating (1–5 stars) and optional comment |
| FR-REV-3 | Admin can moderate (delete) reviews |
| FR-REV-4 | Average rating is shown on the product card |

### 5.8 Admin Panel
| ID | Requirement |
|----|-------------|
| FR-ADM-1 | Admin can manage (CRUD) products and categories |
| FR-ADM-2 | Admin can view and update order statuses |
| FR-ADM-3 | Admin can manage users (view, disable) |
| FR-ADM-4 | Admin can view sales dashboard (total revenue, orders, top products) |

### 5.9 AI Shopping Assistant
| ID | Requirement |
|----|-------------|
| FR-AI-1 | Chat widget is accessible on all pages for authenticated users |
| FR-AI-2 | Assistant provides contextual help regarding products and categories |
| FR-AI-3 | Conversation history is saved per user |
| FR-AI-4 | Users can start new conversations or delete past ones |
| FR-AI-5 | AI inference runs locally using Ollama |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | API response time < 300ms for 95th percentile |
| **Scalability** | Stateless backend, horizontally scalable |
| **Security** | HTTPS, JWT auth, SQL injection prevention, input validation |
| **Availability** | 99.9% uptime (production target) |
| **Responsiveness** | Mobile-first UI, supports screens from 320px to 4K |
| **SEO** | Server-side rendering for product pages |
| **Accessibility** | WCAG 2.1 AA compliant |

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Spring Boot 3.x, Java 21 |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis |
| **File Storage** | AWS S3 / Cloudinary |
| **Auth** | JWT + Spring Security |
| **Payment** | Razorpay |
| **Container** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 8. User Stories

### Customer
- As a customer, I want to browse products by category so I can find what I need.
- As a customer, I want to search for products so I can quickly locate specific items.
- As a customer, I want to add products to my cart so I can purchase multiple items at once.
- As a customer, I want to securely pay online so I can complete my purchase.
- As a customer, I want to track my order so I know when it will arrive.
- As a customer, I want to leave a review so I can share my experience.
- As a customer, I want to chat with an AI assistant to get product recommendations and shopping help.

### Admin
- As an admin, I want to add/edit products so the catalogue stays up to date.
- As an admin, I want to update order statuses so customers are informed of progress.
- As an admin, I want to view sales analytics so I can make business decisions.

---

## 9. Milestones

| Milestone | Target Date | Deliverables |
|-----------|-------------|-------------|
| M1 - Docs & Setup | Week 1 | PRD, TDD, DB Schema, Project scaffold |
| M2 - Core Backend | Week 2–3 | Auth, Products, Cart, Orders API |
| M3 - Frontend | Week 4–5 | Storefront, Cart, Checkout pages |
| M4 - Admin Panel | Week 6 | Admin dashboard & management pages |
| M5 - Payments & QA | Week 7 | Payment integration, testing |
| M6 - Deployment | Week 8 | Docker, CI/CD, production deployment |

---

## 10. Success Metrics

- Users can complete end-to-end checkout in under 3 minutes
- Zero critical security vulnerabilities at launch
- Page load time < 2 seconds on 4G connection
- Admin can manage products without developer assistance
