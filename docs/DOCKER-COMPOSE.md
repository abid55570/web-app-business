# Docker Compose

Drop-in `docker-compose.yml` layouts for:

1. **A generated customer app** (FastAPI/Django backend + Next.js frontend + Postgres + Redis)
2. **The b-dash Studio** standalone
3. **The Studio with a y-websocket sidecar** (real-time co-editing)
4. **Full production stack** with Traefik reverse-proxy + TLS

All snippets are paste-and-run; tune `image:` tags, env files, and volumes for your project name.

---

## 1 · Generated customer app — full stack

This is what the wirer emits when `deployTarget: docker-zip` is set on the recipe. Drop in `<generated-out>/docker-compose.yml`:

```yaml
# docker-compose.yml — generated FastAPI + Next.js + Postgres + Redis
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB:-app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_healthy }
    env_file: .env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-app}:${POSTGRES_PASSWORD:-changeme}@db:5432/${POSTGRES_DB:-app}
      REDIS_URL: redis://redis:6379/0
    ports: ["8000:8000"]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on: [backend]
    env_file: .env
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://backend:8000
    ports: ["3000:3000"]
    command: pnpm start

volumes:
  postgres_data:
```

### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml poetry.lock* requirements.txt* ./
RUN pip install --no-cache-dir poetry==1.8.3 && \
    if [ -f poetry.lock ]; then poetry config virtualenvs.create false && poetry install --no-root --only main; \
    elif [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

FROM deps AS runtime
COPY . .
RUN if [ -f alembic.ini ]; then echo "Run 'alembic upgrade head' on boot via entrypoint."; fi
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN corepack enable && pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["pnpm", "start"]
```

### .env file (next to docker-compose.yml)

```ini
# Postgres
POSTGRES_USER=app
POSTGRES_PASSWORD=changeme-please
POSTGRES_DB=app

# Auth (FastAPI starters using auth-jwt module)
JWT_SECRET=replace-with-openssl-rand-hex-32

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (payment-stripe / payment-stripe-subs modules)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (notif-email module)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@example.com

# SMS (notif-sms module)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Telemetry (telemetry-* modules)
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

(See [ENV-VARS.md](./ENV-VARS.md) for the full module-by-module reference.)

### Run it

```bash
docker compose up -d --build
docker compose logs -f backend frontend
# → http://localhost:3000 (frontend)
# → http://localhost:8000/docs (FastAPI Swagger UI)
```

### Run migrations (FastAPI + alembic)

```bash
docker compose exec backend alembic upgrade head
```

### Run migrations (Django)

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
```

---

## 2 · Studio standalone

For running the b-dash Studio (the visual editor) on its own:

```yaml
# docker-compose.studio.yml
version: "3.9"

services:
  studio:
    build:
      context: ./apps/studio
    restart: unless-stopped
    ports: ["3001:3001"]
    environment:
      STUDIO_OUTPUT_DIR: /data
      NODE_ENV: production
    volumes:
      # Read-only mount of the section + theme catalog
      - ./sections:/app/sections:ro
      - ./themes:/app/themes:ro
      - ./starters:/app/starters:ro
      - ./modules:/app/modules:ro
      # Read-write for studio state + uploads + snapshots
      - studio_data:/data

volumes:
  studio_data:
```

Run:

```bash
docker compose -f docker-compose.studio.yml up -d
# → http://localhost:3001
```

---

## 3 · Studio + y-websocket (real-time collab)

Activate Studio S5c's real-time co-editing by adding a y-websocket sidecar:

```yaml
# docker-compose.studio-collab.yml
version: "3.9"

services:
  studio:
    build: ./apps/studio
    restart: unless-stopped
    ports: ["3001:3001"]
    environment:
      STUDIO_OUTPUT_DIR: /data
      YJS_WEBSOCKET_URL: ws://yjs:1234
    volumes:
      - ./sections:/app/sections:ro
      - studio_data:/data
    depends_on: [yjs]

  yjs:
    image: node:20-alpine
    restart: unless-stopped
    working_dir: /app
    command: >
      sh -c "npm i -g y-websocket && PORT=1234 HOST=0.0.0.0 y-websocket"
    ports: ["1234:1234"]
    volumes:
      - yjs_data:/app/data

volumes:
  studio_data:
  yjs_data:
```

You'll also need to:

1. `pnpm --filter @b-dash/studio-app add yjs y-websocket` (activates the opt-in CRDT dep)
2. Edit `apps/studio/lib/collab.ts` and replace `makeNoOpProvider()` with the real yjs provider (the file has the interface ready).

---

## 4 · Full production stack with Traefik reverse-proxy

For real-world TLS + multi-app routing on a single VPS:

```yaml
# docker-compose.prod.yml
version: "3.9"

services:
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    command:
      - --providers.docker
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.http.redirections.entryPoint.to=websecure
      - --entrypoints.web.http.redirections.entryPoint.scheme=https
      - --certificatesresolvers.le.acme.tlschallenge=true
      - --certificatesresolvers.le.acme.email=ops@example.com
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
    ports: ["80:80", "443:443"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  backend:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    depends_on: [db, redis]
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=Host(`api.example.com`)
      - traefik.http.routers.api.entrypoints=websecure
      - traefik.http.routers.api.tls.certresolver=le
      - traefik.http.services.api.loadbalancer.server.port=8000

  frontend:
    build: ./frontend
    restart: unless-stopped
    env_file: .env
    depends_on: [backend]
    labels:
      - traefik.enable=true
      - traefik.http.routers.web.rule=Host(`example.com`) || Host(`www.example.com`)
      - traefik.http.routers.web.entrypoints=websecure
      - traefik.http.routers.web.tls.certresolver=le
      - traefik.http.services.web.loadbalancer.server.port=3000

  studio:
    build: ./apps/studio
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./sections:/app/sections:ro
      - studio_data:/data
    labels:
      - traefik.enable=true
      - traefik.http.routers.studio.rule=Host(`studio.example.com`)
      - traefik.http.routers.studio.entrypoints=websecure
      - traefik.http.routers.studio.tls.certresolver=le
      - traefik.http.routers.studio.middlewares=studio-auth
      - traefik.http.middlewares.studio-auth.basicauth.users=admin:$$apr1$$...    # htpasswd -nb admin secret
      - traefik.http.services.studio.loadbalancer.server.port=3001

volumes:
  postgres_data:
  studio_data:
  letsencrypt:
```

Point your DNS `A` records at the VPS, then:

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose logs -f traefik
```

Traefik will issue Let's Encrypt certs automatically. Studio is gated behind basic-auth at the proxy layer in addition to the S5b session auth inside the app.

---

## Useful commands

```bash
# Tail logs
docker compose logs -f backend frontend

# Run one-off command in backend
docker compose exec backend python manage.py shell
docker compose exec backend alembic revision --autogenerate -m "add foo"

# Reset Postgres (DESTRUCTIVE)
docker compose down -v && docker compose up -d

# Build only one service
docker compose build backend
docker compose up -d --no-deps backend

# Backup Postgres
docker compose exec db pg_dump -U app app > backup-$(date +%F).sql

# Restore Postgres
docker compose exec -T db psql -U app app < backup.sql
```

---

## Next docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel/Render/Fly recipes
- [ENV-VARS.md](./ENV-VARS.md) — full env var reference per module
- [LOCAL-SETUP.md](./LOCAL-SETUP.md) — first-time setup
