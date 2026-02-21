# ShopEase – Deployment Checklist

## Pre-Deployment

- [ ] Copy `.env.example` → `.env` and fill all values
- [ ] Set a strong `APP_JWT_SECRET` (minimum 64 characters): `openssl rand -hex 32`
- [ ] Set a strong `POSTGRES_PASSWORD`
- [ ] Set real Cloudinary credentials (`CLOUDINARY_URL`)
- [ ] Set real Razorpay credentials (`APP_RAZORPAY_KEY_ID`, `APP_RAZORPAY_KEY_SECRET`)
- [ ] Set `APP_CORS_ALLOWED_ORIGINS` to your production frontend URL
- [ ] Set `NEXT_PUBLIC_API_URL` to your production backend URL

## Docker Compose (Local / VPS)

```bash
# 1. Clone the repo
git clone <repo-url> && cd ecommerce

# 2. Set up secrets
cp .env.example .env
# Edit .env with real values

# 3. Start all services
docker-compose up -d

# 4. Verify health
docker-compose ps

# 5. Tail logs
docker-compose logs -f backend
```

## Verification Steps

- [ ] `GET /actuator/health` → returns `{"status":"UP"}`
- [ ] `GET /api/v1/products` → returns product list (not 500)
- [ ] `GET /api/v1/categories` → returns category list (not 500)
- [ ] Frontend loads at `http://localhost:3000`
- [ ] User can register, login, browse products
- [ ] User can add to cart and proceed to checkout
- [ ] Admin dashboard accessible at `/admin`

## GitHub Actions CI/CD

Add the following **Repository Secrets** in GitHub → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| *(none required)* | `GITHUB_TOKEN` is auto-provided for GHCR push |

Add the following **Repository Variables** (optional):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Production backend URL for frontend build |

## Production Notes

- The frontend Dockerfile uses Next.js **standalone output** — ensure `next.config.js` has `output: 'standalone'`
- Backend healthcheck uses `/actuator/health` — Spring Actuator must be enabled
- Redis is used for caching only; data loss on restart is acceptable
- PostgreSQL volume `postgres_data` persists across restarts
