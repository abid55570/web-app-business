# Deployment

How to ship the two distinct things in this repo:

1. **Generated customer apps** — what `b-dash generate` produces. Deploys to Vercel / Render / Fly / Docker.
2. **The b-dash Studio** — the visual builder app at `apps/studio/`. Deploys anywhere Next.js runs.

The generator itself (the CLI + libraries under `packages/`) is just a build-time tool — nothing to "deploy."

---

## 1 · Deploying a generated app

When you `b-dash generate`, the wirer reads the recipe's `deployTarget` field and emits the deploy config for that target. Supported targets:

| `deployTarget` | What gets emitted | Where to push |
|---|---|---|
| `vercel` | `vercel.json` + env mapping | `vercel deploy` from the generated `/frontend` |
| `render` | `render.yaml` (services + databases) | Push repo to Render via dashboard |
| `fly` | `fly.toml` + `Dockerfile` | `fly launch` then `fly deploy` |
| `docker-zip` | `Dockerfile` + `docker-compose.yml` | `docker compose up -d` anywhere |
| `none` | nothing (local dev only) | n/a |

Set it in your starter recipe:

```jsonc
{
  "id": "my-app",
  "deployTarget": "vercel",
  // ...
}
```

Or one-off override:

```bash
node packages/cli/dist/index.js generate starters/my.recipe.json \
  --out ./out --deploy-target docker-zip
```

### Vercel

The emitted `vercel.json` wires:

- `frontend/` as the project root
- API routes proxied to your FastAPI/Django backend (which you deploy separately to Render/Fly)
- Env vars listed as `secret` placeholders — set them in the Vercel dashboard

```bash
cd out/frontend
vercel --prod
# set env in dashboard, then redeploy
```

If your backend runs on Render, set:

```
NEXT_PUBLIC_API_BASE_URL=https://my-api.onrender.com
```

### Render

`render.yaml` is a full blueprint — web service for backend, web service for frontend, Postgres + Redis if your starter uses them.

```bash
# In the Render dashboard:
# 1. New → Blueprint
# 2. Connect repo, point at out/render.yaml
# 3. Add env vars (secrets are placeholders in the blueprint)
# 4. Deploy
```

### Fly.io

```bash
cd out
fly launch                          # walks you through region + scaling
fly secrets set DATABASE_URL=... STRIPE_KEY=...
fly deploy
```

The `Dockerfile` ships both frontend + backend in one image (multistage build). If you want separate apps per service, use the `docker-zip` target instead and adapt.

### Docker (anywhere)

```bash
cd out
docker compose up -d --build
```

That's a full stack: Postgres + Redis + your FastAPI/Django backend + Next.js frontend.

For production deploys behind a real load balancer, see [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — it shows how to layer Traefik / Caddy / nginx on top.

---

## 2 · Deploying the Studio

The Studio is a Next.js 15 app under `apps/studio/`. It serves on port 3001 in dev. For prod:

```bash
cd apps/studio
pnpm build
pnpm start                          # → port 3001
```

### Vercel (recommended for Studio)

```bash
cd apps/studio
vercel
```

Add these env vars in the Vercel dashboard:

```
STUDIO_SECTIONS_ROOT=/var/task/sections    # bundled at build time
STUDIO_OUTPUT_DIR=/tmp                     # ephemeral on Vercel; use S3/R2 for prod assets
```

**Important — Vercel caveat**: the Studio's `/api/render` route shells out to the wirer (`spawn('node', [cli, 'generate', ...])`). On Vercel this works for cold starts < 60s but won't scale; for production:

- Move render to a background worker (Inngest, Trigger.dev, or AWS Lambda)
- Have Studio POST a render-request, return a job id, poll for completion

Same applies to `/api/assets` (uses local FS). For prod, wire `S3_BUCKET` + `S3_REGION` env vars and swap the FS calls in `app/api/assets/route.ts` for S3 SDK calls.

### Fly.io (best for prod Studio)

Fly gives you persistent volumes for asset storage + long-running render processes:

```bash
cd apps/studio
fly launch --no-deploy
fly volumes create studio_data --size 10
# In fly.toml:
#   [mounts]
#     source = "studio_data"
#     destination = "/data"
# Set STUDIO_OUTPUT_DIR=/data in fly secrets
fly deploy
```

### Docker

```bash
# In apps/studio/:
cat > Dockerfile <<'DOCKER'
FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next /app/.next
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/
EXPOSE 3001
CMD ["pnpm", "start"]
DOCKER

docker build -t bdash-studio .
docker run -p 3001:3001 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/sections:/app/sections:ro \
  bdash-studio
```

### Studio + production checklist

Before shipping Studio to real customers, configure:

- [ ] `STUDIO_AUTH_PROVIDER` — replace cookie+JSON auth with next-auth (Email/GitHub/Google)
- [ ] `STUDIO_ASSETS_BACKEND=s3` — uploads to S3/R2 instead of local FS
- [ ] `DATABASE_URL` — replace JSON workspace store with Postgres
- [ ] `YJS_WEBSOCKET_URL` — point at a y-websocket sidecar for real-time collab
- [ ] HTTPS — Vercel / Fly handle; on Docker use Caddy/Traefik
- [ ] Rate limiting on `/api/render` (it's expensive)
- [ ] Backup `output/studio-snapshots.json` if you don't move snapshots to Postgres

---

## 3 · Continuous delivery (GitHub Actions)

The wirer emits a `.github/workflows/deploy.yml` when `deployTarget` is set. For your own catalog repo, here's the minimal CI:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r build
      - run: pnpm -r test
      - run: node packages/cli/dist/index.js generate starters/observability-saas/recipe.json --out /tmp/smoke
```

---

## Next docs

- [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — full-stack compose layouts for generated apps + Studio
- [ENV-VARS.md](./ENV-VARS.md) — every env var across modules + studio + wirer
- [LOCAL-SETUP.md](./LOCAL-SETUP.md) — first-time machine setup
