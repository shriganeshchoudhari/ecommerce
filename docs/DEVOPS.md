# DevOps & Project Setup Document
## Project: ShopEase Ecommerce Platform

**Version:** 1.0  
**Date:** 2026-02-20

---

## 1. Project Structure

```
ecommerce/
├── docs/                        # All documentation
│   ├── PRD.md
│   ├── TDD.md
│   ├── DB_SCHEMA.md
│   ├── API_DESIGN.md
│   ├── UI_UX_DESIGN.md
│   └── DEVOPS.md
├── backend/                     # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                    # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml           # Local dev environment
├── docker-compose.prod.yml      # Production
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
└── README.md
```

---

## 2. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 21 (LTS) | Backend runtime |
| Maven | 3.9+ | Backend build |
| Node.js | 20 LTS | Frontend runtime |
| npm | 10+ | Package manager |
| Docker | 24+ | Containerization |
| Docker Compose | 2.x | Local orchestration |
| PostgreSQL | 15 | Database |
| Redis | 7 | Cache |
| Git | 2.x | Version control |

---

## 3. Local Development Setup

### 3.1 Clone & Initialize

```bash
git clone https://github.com/your-org/shopease.git
cd shopease
```

---

### 3.2 Backend Setup (Spring Boot)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your local values
# DB_URL, JWT_SECRET, RAZORPAY_KEY, CLOUDINARY_URL, etc.

# Run (with Maven)
./mvnw spring-boot:run
```

**`src/main/resources/application.yml`:**
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/shopease}
    username: ${DB_USER:shopease}
    password: ${DB_PASS:shopease123}
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

app:
  jwt:
    secret: ${JWT_SECRET:your-256-bit-secret}
    expiration: 3600000        # 1 hour
    refresh-expiration: 604800000  # 7 days
  cloudinary:
    url: ${CLOUDINARY_URL}
  razorpay:
    key-id: ${RAZORPAY_KEY_ID}
    key-secret: ${RAZORPAY_KEY_SECRET}

server:
  port: 8080

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

### 3.3 Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Run dev server
npm run dev
```

---

### 3.4 Docker Compose (Recommended for Local)

**`docker-compose.yml`:**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: shopease_db
    environment:
      POSTGRES_DB: shopease
      POSTGRES_USER: shopease
      POSTGRES_PASSWORD: shopease123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: shopease_redis
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: shopease_backend
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/shopease
      DB_USER: shopease
      DB_PASS: shopease123
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_URL: ${CLOUDINARY_URL}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}

  frontend:
    build: ./frontend
    container_name: shopease_frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080/api/v1

volumes:
  postgres_data:
```

**Start all services:**
```bash
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- pgAdmin (optional): Add to compose

---

## 4. Dockerfiles

### 4.1 Backend Dockerfile

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src/ src/
RUN mvn package -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 4.2 Frontend Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 Backend CI (`.github/workflows/backend-ci.yml`)

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: shopease_test
          POSTGRES_USER: shopease
          POSTGRES_PASSWORD: shopease123
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Run Tests
        run: ./mvnw test
        working-directory: ./backend

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t shopease-backend:${{ github.sha }} ./backend
```

### 5.2 Frontend CI (`.github/workflows/frontend-ci.yml`)

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: ./frontend
      - run: npm run lint
        working-directory: ./frontend
      - run: npm run build
        working-directory: ./frontend
```

---

## 6. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | ✅ | PostgreSQL JDBC URL |
| `DB_USER` | ✅ | DB username |
| `DB_PASS` | ✅ | DB password |
| `REDIS_HOST` | ✅ | Redis host |
| `JWT_SECRET` | ✅ | 256-bit JWT signing secret |
| `CLOUDINARY_URL` | ✅ | Cloudinary connection URL |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay secret key |
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Backend API base URL |

---

## 7. Development Commands Cheatsheet

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Run backend tests
cd backend && ./mvnw test

# Run frontend linting
cd frontend && npm run lint

# Database migration (auto on startup)
# Manual: ./mvnw flyway:migrate

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```
