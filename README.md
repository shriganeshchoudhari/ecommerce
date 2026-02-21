# ShopEase - Ecommerce Platform

A modern, full-featured ecommerce platform built with Next.js and Spring Boot.

## 📁 Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Product Requirements Document — features, user stories, milestones |
| [TDD.md](docs/TDD.md) | Technical Design Document — architecture, modules, tech stack |
| [DB_SCHEMA.md](docs/DB_SCHEMA.md) | Database Schema — all table definitions, indexes, migrations |
| [API_DESIGN.md](docs/API_DESIGN.md) | API Design — all REST endpoints with request/response examples |
| [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) | UI/UX Wireframes — design system, wireframes, user flows |
| [DEVOPS.md](docs/DEVOPS.md) | DevOps Setup — Docker, CI/CD, environment variables |

## 🚀 Quick Start

```bash
# Start all services (DB + Redis + Backend + Frontend)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Spring Boot 3, Java 21 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Payment | Razorpay |
| Storage | Cloudinary |
| Deploy | Docker + GitHub Actions |
