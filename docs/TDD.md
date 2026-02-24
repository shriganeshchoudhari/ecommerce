# Technical Design Document (TDD)
## Project: ShopEase - Full-Stack Ecommerce Website

**Version:** 1.0  
**Date:** 2026-02-20  
**Author:** Engineering Team  
**Status:** Draft

---

## 1. Overview

This document describes the technical architecture, design decisions, and implementation details for the ShopEase ecommerce platform.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│             Next.js 14 (App Router + SSR/SSG)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / REST API
┌─────────────────────────▼───────────────────────────────────┐
│                        API GATEWAY                           │
│              (Spring Boot - Port 8080)                        │
│  ┌────────────┐ ┌─────────────┐ ┌───────────┐ ┌──────────┐ │
│  │ Auth Module│ │Product Mod. │ │Order Mod. │ │ AI Mod.  │ │
│  └────────────┘ └─────────────┘ └───────────┘ └──────────┘ │
└───────┬─────────────────┬─────────────────┬─────────────────┘
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  PostgreSQL  │  │    Redis     │  │ Ollama (AI)  │
│  (Primary DB)│  │   (Cache)    │  │ (Docker)     │
└──────────────┘  └──────────────┘  └──────────────┘
        │
┌───────▼──────┐
│ AWS S3 /     │
│ Cloudinary   │
│ (File Store) │
└──────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Item | Choice | Reason |
|------|--------|--------|
| Framework | Next.js 14 (App Router) | SSR for SEO, React ecosystem |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| State Management | Zustand | Lightweight, simple API |
| Data Fetching | TanStack Query (React Query) | Caching, loading/error states |
| Form Handling | React Hook Form + Zod | Performant, schema validation |
| UI Components | shadcn/ui | Accessible, customizable |
| HTTP Client | Axios | Interceptors, error handling |

### 3.2 Backend

| Item | Choice | Reason |
|------|--------|--------|
| Framework | Spring Boot 3.3 | Production-grade Java |
| Language | Java 21 | LTS, virtual threads |
| ORM | Spring Data JPA + Hibernate | Well-integrated with Spring |
| Security | Spring Security + JWT | Industry standard |
| Validation | Jakarta Bean Validation | Declarative, integrated |
| Build Tool | Maven | Standard, reproducible builds |
| AI Integration | Ollama REST API | Local LLM execution |

### 3.3 Data Layer

| Item | Choice | Reason |
|------|--------|--------|
| Primary DB | PostgreSQL 15 | Relational, ACID, rich features |
| Migrations | Flyway | Version-controlled schema |
| Cache | Redis 7 | Fast, great Spring integration |
| File Storage | Cloudinary | Image CDN + transforms |

---

## 4. Backend Module Design

### 4.1 Package Structure

```
com.shopease/
├── config/          # Security, CORS, Redis, Swagger configs
├── controller/      # REST Controllers
├── service/         # Business Logic
├── repository/      # JPA Repositories
├── entity/          # JPA Entities
├── dto/
│   ├── request/     # Request DTOs
│   └── response/    # Response DTOs
├── mapper/          # Entity <-> DTO mappers (MapStruct)
├── exception/       # Custom exceptions + GlobalExceptionHandler
├── security/        # JWT Filter, UserDetailsService
├── util/            # Helpers and utilities
└── EcommerceApplication.java
```

### 4.2 Core Entities

#### User
```java
@Entity
public class User {
    Long id;
    String name;
    String email;        // unique
    String password;     // BCrypt hashed
    Role role;           // CUSTOMER | ADMIN
    boolean enabled;
    List<Address> addresses;
    List<Order> orders;
    Cart cart;
    List<Wishlist> wishlistItems;
    LocalDateTime createdAt;
}
```

#### Product
```java
@Entity
public class Product {
    Long id;
    String name;
    String description;
    String sku;          // unique
    BigDecimal price;
    int stockQuantity;
    Category category;
    List<ProductImage> images;
    List<Review> reviews;
    Double averageRating;
    boolean active;
    LocalDateTime createdAt;
}
```

#### Order
```java
@Entity
public class Order {
    Long id;
    User user;
    List<OrderItem> items;
    Address shippingAddress;
    OrderStatus status;  // PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED
    BigDecimal totalAmount;
    Payment payment;
    LocalDateTime orderedAt;
}
```

#### Cart
```java
@Entity
public class Cart {
    Long id;
    User user;           // OneToOne
    List<CartItem> items;
    LocalDateTime updatedAt;
}
```

#### Payment
```java
@Entity
public class Payment {
    Long id;
    Order order;
    String razorpayOrderId;
    String razorpayPaymentId;
    PaymentStatus status; // PENDING|SUCCESS|FAILED
    BigDecimal amount;
    LocalDateTime paidAt;
}
```

---

## 5. API Structure

All APIs follow RESTful conventions. Base URL: `/api/v1`

| Module | Base Path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Products | `/api/v1/products` |
| Categories | `/api/v1/categories` |
| Cart | `/api/v1/cart` |
| Wishlist | `/api/v1/wishlist` |
| Orders | `/api/v1/orders` |
| Payments | `/api/v1/payments` |
| Reviews | `/api/v1/reviews` |
| Admin | `/api/v1/admin` |

---

## 6. Security Design

### 6.1 JWT Flow
```
1. User POSTs /auth/login with credentials
2. Server validates credentials
3. Server returns { accessToken, refreshToken }
4. Client stores tokens (accessToken in memory, refreshToken in httpOnly cookie)
5. Client sends Authorization: Bearer <accessToken> on every request
6. Expired accessToken -> Client calls /auth/refresh with refreshToken
7. Server validates refreshToken, returns new accessToken
```

### 6.2 Role-Based Access Control

| Endpoint Pattern | CUSTOMER | ADMIN |
|-----------------|----------|-------|
| GET /products/** | ✅ | ✅ |
| POST /cart/** | ✅ | ✅ |
| POST /orders/** | ✅ | ✅ |
| GET /admin/** | ❌ | ✅ |
| POST /admin/** | ❌ | ✅ |

---

## 7. Caching Strategy

| Data | Cache Key | TTL |
|------|-----------|-----|
| Product List (by category) | `products:cat:{id}:page:{n}` | 10 min |
| Product Detail | `product:{id}` | 30 min |
| Category Tree | `categories:all` | 1 hour |
| User Cart | `cart:user:{id}` | 5 min |
| AI Conversation | `ai:conv:{id}` | 10 min |

Cache invalidated on write operations.

---

## 8. Frontend Architecture

### 8.1 App Router Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (store)/
│   ├── page.tsx              # Home
│   ├── products/
│   │   ├── page.tsx          # Product Listing
│   │   └── [id]/page.tsx     # Product Detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── orders/
│       ├── page.tsx          # Order History
│       └── [id]/page.tsx     # Order Detail
├── (admin)/
│   └── admin/
│       ├── page.tsx          # Dashboard
│       ├── products/page.tsx
│       └── orders/page.tsx
├── layout.tsx
└── globals.css
```

### 8.2 State Management

| State | Tool |
|-------|------|
| Auth (user, tokens) | Zustand (persisted) |
| Cart | Zustand (synced with backend) |
| Server data (products, orders) | TanStack Query |
| Form state | React Hook Form |

---

## 9. Database Design

See: [DB_SCHEMA.md](./DB_SCHEMA.md) for full ERD and table definitions.

---

## 10. Error Handling

### Backend
- `GlobalExceptionHandler` using `@ControllerAdvice`
- Standard error response: `{ timestamp, status, error, message, path }`
- Custom exceptions: `ResourceNotFoundException`, `UnauthorizedException`, `PaymentException`

### Frontend
- Axios interceptors for global 401/403 handling (auto-refresh token)
- React Query error boundaries for rendering errors
- Toast notifications for user-visible errors

---

## 11. Testing Strategy

| Level | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (Backend) | JUnit 5 + Mockito | 80% |
| Integration (Backend) | Spring Boot Test + TestContainers | Key flows |
| E2E | Playwright | Critical user journeys |
| Frontend | Jest + React Testing Library | Components |

---

## 12. Deployment

See: [DEVOPS.md](./DEVOPS.md) for full deployment setup.

### Summary
- **Local**: Docker Compose (all services)
- **CI**: GitHub Actions (build, test, lint on every PR)
- **Production**: Docker containers on VPS or AWS ECS

---

## 13. Non-Functional Considerations

- **Pagination**: All list APIs use cursor/page-based pagination (default size: 20)
- **Image Upload**: Multipart upload to Cloudinary; URL stored in DB
- **Soft Delete**: Products and users are soft-deleted (active/enabled flag)
- **Audit Fields**: All entities have `createdAt` and `updatedAt`
