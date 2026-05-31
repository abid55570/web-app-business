# Developer tutorial — your first generated app, end-to-end

This is a hands-on walkthrough. By the end you'll have:

- ✅ The repo running locally
- ✅ A complete Next.js + FastAPI app generated from a starter
- ✅ Both running locally with a Postgres database
- ✅ One customization applied via the Studio
- ✅ The customized app regenerated + redeployed

Budget: **45 minutes** first time, ~15 minutes for repeat runs.

> If you're a non-tech user wanting to use the Studio, see [STUDIO-TUTORIAL.md](./STUDIO-TUTORIAL.md) instead.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| **Node.js** | 20+ | `node -v` should show v20.x or higher |
| **pnpm** | 9+ | `pnpm -v` → install via `npm i -g pnpm` if missing |
| **Python** | 3.11+ | `python --version` (for FastAPI backends) |
| **Docker** (optional) | any recent | `docker --version` — for the all-in-one Postgres + Redis stack |
| **Git** | any | `git --version` |

Windows users: PowerShell or Git Bash both work. Use `;` instead of `&&` to chain commands in PowerShell.

---

## Step 1 — Clone + install (5 min)

```bash
git clone https://github.com/abid55570/web-app-business.git
cd web-app-business
pnpm install
```

`pnpm install` walks the workspace globs (`packages/*`, `apps/*`, `sections/`, `themes/`, `modules/`) and links workspace deps. First install pulls ~250 MB.

Then build the library packages:

```bash
pnpm -r build
```

Sanity check:

```bash
pnpm -r test
```

You should see **205/205 passing** across schemas (77) · wirer (104) · studio (10) · cli (14). If any fail, see [LOCAL-SETUP.md](./LOCAL-SETUP.md) "Troubleshooting".

---

## Step 2 — Browse the catalog (2 min)

The repo ships with:

```bash
ls modules/         # 39 backend modules (auth, payments, email, ws, etc.)
ls themes/          # 75 themes
ls starters/        # 58 starter recipes
ls sections/        # 538 sections across 44 categories
```

Quick peek at what's available:

```bash
# List all starters with their archetype
ls starters/ | head -20

# Look at one recipe to understand the shape
cat starters/observability-saas/recipe.json | head -40
```

A recipe is a single JSON file that pins:
- Tech stack (FastAPI vs Django, Next.js)
- Database (Postgres or SQLite)
- Theme
- Module list
- Auth methods
- Payment gateways
- Notification channels
- Deploy target

The wirer reads the recipe + composes all the listed modules into one runnable project.

---

## Step 3 — Generate your first app (1 min)

Pick a starter. For this tutorial we'll use `observability-saas` — a SaaS with Sentry + PostHog + Plausible + Stripe + tenants + audit:

```bash
node packages/cli/dist/index.js generate \
  starters/observability-saas/recipe.json \
  --out /tmp/my-app
```

Output:

```
Generating starter-observability-saas
  output:  /tmp/my-app
  modules: B:\dash\app-generator\modules
  theme:   nordic
  15 modules in topological order

✓ 137 files written across 15 modules.
  cd /tmp/my-app
```

That's 137 files of frontend + backend + database schema + email templates + deploy config, all composed deterministically from the modules.

Inspect what was produced:

```bash
ls /tmp/my-app
# .gitignore  .env.example  README.md  docker-compose.yml
# frontend/   backend/      prisma/

ls /tmp/my-app/backend/app
# 15 module subdirs — audit_log, auth_jwt, payment_stripe, tenants, etc.

ls /tmp/my-app/frontend/src
# components, pages, lib, app
```

---

## Step 4 — Run the generated app locally (10 min)

You have two options. Docker is simpler.

### Option A — Docker (recommended for first run)

```bash
cd /tmp/my-app
cp .env.example .env

# Edit .env — fill in at minimum:
#   JWT_SECRET=$(openssl rand -hex 32)
#   STRIPE_SECRET_KEY=sk_test_...  (from stripe.com/dashboard, test mode)
# Other vars can stay as defaults for now

docker compose up -d --build
docker compose logs -f
```

After ~2 minutes:
- **Frontend** → http://localhost:3000
- **Backend API + Swagger** → http://localhost:8000/docs
- **Postgres** → localhost:5432 (user `app`, pass `changeme`)

Run database migrations:

```bash
docker compose exec backend alembic upgrade head
```

You should now see your app at http://localhost:3000.

### Option B — Native (two terminals)

```bash
# === Terminal 1 — backend ===
cd /tmp/my-app/backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env          # fill in JWT_SECRET etc.
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# === Terminal 2 — frontend ===
cd /tmp/my-app/frontend
pnpm install
pnpm dev                            # → http://localhost:3000
```

---

## Step 5 — Customize via Studio (5 min)

In a third terminal, run the Studio:

```bash
cd <web-app-business>
pnpm --filter @b-dash/studio-app dev    # → http://localhost:3001
```

Open http://localhost:3001 in your browser. You'll see the visual builder.

**Try this**:

1. Press <kbd>/</kbd> to focus the search box · type "hero"
2. Click "Hero with stats" — it appears on the canvas
3. Click the heading text on the canvas — type a new title
4. Switch theme dropdown (top bar) from `nordic` to `aurora`
5. Press <kbd>⌘S</kbd> (or `Ctrl+S`) to save

What just happened: Studio wrote your changes to `B:/dash/app-generator/studio-state.json`. This file is the source of truth for your Studio session.

---

## Step 6 — Render the customized app (2 min)

In Studio, click the **▶ Render** button in the top bar. A modal opens showing:

- **Diff** — what changed since last save
- **Render now** — green button

Click **Render now**. The wirer subprocess runs and produces output at `/tmp/studio-<timestamp>/`. The log tails in the modal:

```
Generating starter-observability-saas
  ✓ 137 files written across 15 modules.
```

> Note: in S4 the Studio renders against a sample starter (`observability-saas`). Mapping the Studio's page-state to a custom-built recipe is on the S5a roadmap. For now the customizations from Studio populate `studio-state.json` but the rendered app uses the original starter. The next phase will close that loop.

---

## Step 7 — Deploy somewhere (10 min)

Pick a deploy target. The easiest free option is **Vercel** (frontend) + **Render** (backend).

### Vercel (frontend)

```bash
cd /tmp/my-app/frontend
npx vercel
# Follow prompts — link to a new project, accept defaults
# Set these env vars in Vercel dashboard:
#   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
#   NEXT_PUBLIC_SENTRY_DSN=...
npx vercel --prod
```

Your frontend is live at `https://your-project.vercel.app`.

### Render (backend + Postgres)

1. Push `/tmp/my-app` to a GitHub repo
2. Go to render.com → New → Blueprint
3. Connect your repo, Render auto-detects `render.yaml`
4. Add env vars (Stripe keys, JWT secret, etc.)
5. Click "Apply"

Render provisions: Postgres + Redis + your backend on its own subdomain.

### Docker (anywhere)

If you have a VPS (DigitalOcean, Hetzner, Linode):

```bash
scp -r /tmp/my-app user@your-vps:/srv/my-app
ssh user@your-vps
cd /srv/my-app
docker compose up -d --build
```

Add Caddy or Traefik in front for TLS — see [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) §4.

---

## Step 8 — Add a new section to the catalog (5 min)

Let's create a new section so you can see how the catalog extends.

```bash
cd <web-app-business>
mkdir -p sections/hero/MyHero
```

Create `sections/hero/MyHero/MyHero.tsx`:

```tsx
export type MyHeroProps = {
  heading: string
  subheading?: string
}

export function MyHero({ heading, subheading }: MyHeroProps) {
  return (
    <section className="px-6 py-20 text-center bg-primary text-primary-foreground">
      <h1 className="text-5xl font-bold">{heading}</h1>
      {subheading && <p className="mt-4 text-lg opacity-90">{subheading}</p>}
    </section>
  )
}
```

Create `sections/hero/MyHero/section.yaml`:

```yaml
id: MyHero
displayName: "My Hero"
description: "A hero I built myself."
version: 1.0.0
category: hero
density: spacious
componentFile: ./MyHero.tsx
props:
  heading:
    type: string
    label: "Heading"
    required: true
  subheading:
    type: string
    label: "Subheading"
tags: [hero, custom]
bestWithThemes: [minimal, glass]
deprecated: false
```

Reload the Studio — `MyHero` now appears in the palette under "hero", with its emoji thumbnail. You can drag it onto any page.

Run the schema tests to validate your new manifest:

```bash
pnpm --filter @b-dash/wirer test
```

All 104 tests should still pass.

---

## Step 9 — Add a new module to the catalog (15 min)

Modules are the backend feature units (auth, payments, etc.). Let's create a minimal `quote-of-day` module that exposes a single API endpoint.

```bash
mkdir -p modules/quote-of-day/{backend/app/quote_of_day,frontend/components,api-routes}
```

Create `modules/quote-of-day/module.yaml`:

```yaml
id: quote-of-day
displayName: "Quote of the Day"
description: "Returns a daily inspirational quote."
version: 1.0.0
category: utility
backend_stack: fastapi
provides:
  - quote.read
depends_on: []
emits: []
subscribes: []
permissions: []
env_keys: []
frontend_files:
  - frontend/components/QuoteOfDay.tsx
backend_files:
  - backend/app/quote_of_day/router.py
  - backend/app/quote_of_day/service.py
api_routes:
  - api-routes/quote.ts
```

Create the backend service `modules/quote-of-day/backend/app/quote_of_day/service.py`:

```python
from datetime import date
import hashlib

QUOTES = [
    "Ship early, ship often.",
    "Build for yourself first.",
    "Done is better than perfect.",
    "Make the customer's life easier.",
    "If it's worth doing, it's worth doing badly first.",
]

def quote_for_today() -> str:
    """Deterministic quote of the day based on the date."""
    seed = hashlib.md5(date.today().isoformat().encode()).hexdigest()
    idx = int(seed[:4], 16) % len(QUOTES)
    return QUOTES[idx]
```

Backend router `modules/quote-of-day/backend/app/quote_of_day/router.py`:

```python
from fastapi import APIRouter
from .service import quote_for_today

router = APIRouter(prefix="/api/quote", tags=["quote"])

@router.get("/today")
def get_quote_today() -> dict:
    return {"quote": quote_for_today()}
```

Frontend component `modules/quote-of-day/frontend/components/QuoteOfDay.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'

export function QuoteOfDay() {
  const [quote, setQuote] = useState<string>('Loading…')
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/quote/today`)
      .then((r) => r.json())
      .then((d) => setQuote(d.quote))
  }, [])
  return (
    <blockquote className="border-l-4 border-primary pl-4 italic">
      &ldquo;{quote}&rdquo;
    </blockquote>
  )
}
```

API route stub `modules/quote-of-day/api-routes/quote.ts` (Next API proxy):

```ts
export async function GET() {
  const r = await fetch(`${process.env.API_BASE_URL}/api/quote/today`)
  return Response.json(await r.json())
}
```

Now add `quote-of-day` to any starter recipe to include it. Edit `starters/observability-saas/recipe.json` and add `"quote-of-day"` to the `modules` array.

Regenerate:

```bash
node packages/cli/dist/index.js generate starters/observability-saas/recipe.json --out /tmp/my-app
```

The new module is now included. Restart your generated app:

```bash
cd /tmp/my-app
docker compose down
docker compose up -d --build
```

Hit the endpoint:

```bash
curl http://localhost:8000/api/quote/today
# {"quote":"Ship early, ship often."}
```

You've added a new feature to the catalog. It's now available to every future generation.

---

## Step 10 — Push your changes (3 min)

```bash
cd <web-app-business>
git status                      # see what changed
git add .
git commit -m "Add MyHero section + quote-of-day module"
git push
```

The catalog now permanently includes your additions. Anyone who clones the repo gets your section + module.

---

## Where to go next

- 📖 [USER-MANUAL.md](./USER-MANUAL.md) — full Studio reference
- 🎨 [STUDIO-TUTORIAL.md](./STUDIO-TUTORIAL.md) — non-tech walkthrough
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) — production deploys (Vercel/Render/Fly/Docker)
- 🐳 [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — ready-to-paste compose layouts
- 🔧 [ENV-VARS.md](./ENV-VARS.md) — module-by-module env reference
- 📦 [PUSHING-CODE.md](./PUSHING-CODE.md) — repo strategy + CI templates
- 💰 [MONETIZATION-PLAN.md](./MONETIZATION-PLAN.md) — hosted Studio + pricing + Stripe integration path

## Common dev workflows

### Add a new theme

```bash
mkdir themes/my-theme
# Create theme.yaml + tokens.json (copy from themes/minimal/ as a template)
# Reload Studio — your theme appears in the dropdown
```

### Test that all sections render

```bash
pnpm --filter @b-dash/wirer test
# 104 tests run including a scanSections check that validates every section.yaml
```

### Smoke-test all 58 starters at once

```bash
for r in starters/*/recipe.json; do
  out=/tmp/smoke-$(basename $(dirname $r))
  node packages/cli/dist/index.js generate "$r" --out "$out" || echo "FAIL: $r"
done
```

### Watch mode for catalog changes

```bash
pnpm -r --parallel dev
# Builds packages on change; Studio HMR picks up section edits
```

### Run a specific test file

```bash
pnpm --filter @b-dash/wirer exec vitest run tests/sections.test.ts
```

### Debug a render failure

```bash
node packages/cli/dist/index.js generate <recipe> --out /tmp/debug 2>&1 | tee debug.log
# The wirer logs every module load + every file write
```

You're now a b-dash developer. Have fun.
