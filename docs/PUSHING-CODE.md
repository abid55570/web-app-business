# Pushing code · repo strategy · running locally

The b-dash project produces two kinds of repos. Decide which you're working on first:

```
                ┌───────────────────────────────┐
                │  Which repo are you pushing?  │
                └───────────────┬───────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                                │
   ┌────▼─────────────────────┐              ┌──────────▼──────────────┐
   │ ① The b-dash generator   │              │ ② A generated app       │
   │ (the tool itself)         │              │ (output of `b-dash      │
   │                           │              │  generate`)              │
   │ packages/ + apps/         │              │ frontend/ + backend/     │
   │ + sections/ + themes/     │              │ + docker-compose.yml     │
   │ + modules/ + starters/    │              │                          │
   └────┬──────────────────────┘              └──────────┬──────────────┘
        │                                                 │
        │ ONE repo, always.                              │ ONE repo per
        │ The monorepo IS the project.                   │ generated app.
        │                                                 │ Skip if you can
        ▼                                                 ▼ avoid splitting.
```

## TL;DR repo recommendation

| What | Repo strategy | Why |
|---|---|---|
| The b-dash generator | **1 monorepo** (always) | pnpm workspaces glue packages together; splitting breaks `workspace:*` deps |
| A generated app | **1 monorepo** (default) | Atomic commits, single CI, one clone for new devs, easier env-var management |
| A generated app — *if you must split* | 1 repo per service (`*-frontend`, `*-backend`) | Only when teams + deploy cadences are genuinely separate |

**Stop reading and pick monorepo unless you have a hard organisational reason to split.**

---

## ① Pushing the b-dash generator repo

This is what you're sitting in right now (`B:\dash\app-generator\`).

### 1 · Init git

```bash
cd B:/dash/app-generator
git init
git branch -m main
```

### 2 · Verify .gitignore

The project should already have one. If not, drop this in `.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
**/dist/
**/.next/
**/.turbo/
**/build/

# Local env + secrets
.env
.env.local
.env.*.local
*.local

# Studio runtime data — DO NOT commit
output/
studio-state.json

# Generated apps (one-off outputs, regen any time)
/tmp/
generated/

# OS / editor cruft
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test artefacts
coverage/
*.lcov

# Python (in case you scaffold a backend locally)
__pycache__/
*.pyc
.venv/
.pytest_cache/
```

### 3 · First commit

```bash
git add .
git status                      # sanity-check what's staged
git commit -m "Initial commit: b-dash generator + 538-section catalog + Studio"
```

### 4 · Create the remote

**GitHub** (CLI):
```bash
gh repo create my-org/b-dash --private --source=. --remote=origin
git push -u origin main
```

**GitHub** (web): create empty repo at github.com → copy the "push existing repo" snippet:
```bash
git remote add origin git@github.com:my-org/b-dash.git
git push -u origin main
```

**GitLab / Bitbucket** — same pattern, swap the host.

### 5 · Subsequent pushes

```bash
git add .
git commit -m "Add wave 34 sections + 2 new themes"
git push
```

---

## ② Pushing a generated app

When you run `b-dash generate` (either from the CLI or the Studio's Render button), the output is a complete, self-contained project tree at the `--out` path. That tree is what you push.

```
my-app/                           ← THIS is your generated app repo
├── frontend/                     ← Next.js (auto-generated)
│   ├── src/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── Dockerfile               ← if deployTarget = docker-zip
├── backend/                      ← FastAPI or Django (auto-generated)
│   ├── app/
│   ├── alembic/                 ← FastAPI migrations
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── docker-compose.yml            ← full stack (Postgres + Redis + both)
├── .env.example                  ← every env var listed
├── .gitignore                    ← auto-generated
├── recipe.json                   ← the source of truth — DO commit
└── README.md                     ← auto-generated app docs
```

### 1 · `cd` into the generated dir + init git

```bash
cd /path/to/my-app
git init
git branch -m main
```

The wirer already wrote a `.gitignore` for you. Verify it covers:

```gitignore
node_modules/
.next/
__pycache__/
.venv/
.env
.env.local
*.local
dist/
build/
*.log
.DS_Store
```

### 2 · Commit `recipe.json` — it's the source of truth

The `recipe.json` at the project root is what produced this tree. If you ever lose the generated code, you can regenerate it from the recipe + the b-dash catalog.

```bash
git add .
git commit -m "Initial: generated from observability-saas starter"
```

### 3 · Push

```bash
gh repo create my-org/acme-app --private --source=. --remote=origin
git push -u origin main
```

### 4 · Regeneration workflow

When you change something in the Studio + click "Render":

1. The wirer rewrites the generated tree
2. **Your `overrides/` folder is preserved** — anything you hand-edited stays
3. `recipe.json` is updated to reflect the new state
4. You commit the diff

```bash
cd /path/to/my-app
git status                       # see what regen changed
git add .
git commit -m "Regen: added pricing page, switched to glass theme"
git push
```

> The wirer's overlay system means you can safely hand-edit generated files inside `overrides/` and they survive regeneration. See `docs/spike-notes.md` for the overlay mechanic.

---

## Why monorepo (not split frontend/backend)?

If you're considering separate repos for `acme-frontend` and `acme-backend`, here's the cost-benefit:

### Costs of splitting

- **2× the boilerplate** — two CI configs, two deploy configs, two READMEs, two issue trackers
- **Atomicity gone** — a schema change in backend + UI update in frontend can no longer land in one commit. PRs reviewed separately. Merge order matters. Easy to ship a broken state.
- **Env var drift** — same vars need to be set in two places. Lots of mistakes here.
- **Local dev complexity** — new dev clones two repos, links them manually, runs two install commands.
- **Type sharing breaks** — if you want to share TypeScript types (e.g. via OpenAPI codegen) across frontend ↔ backend, splitting forces a third "shared types" repo or npm publishing.
- **Renaming the project gets messy** — has to happen in lockstep across both.

### Benefits of splitting

- Different teams with separate deploy cadences (e.g. frontend ships daily, backend ships weekly)
- Different orgs / cost centres own each side
- One side is open-source, the other isn't
- Compliance requires physical separation

If **none** of those apply: don't split. Monorepo wins.

### The "but my deploy needs two repos" myth

Vercel deploys monorepos perfectly. Render's blueprints handle multi-service monorepos. Fly does too. Docker Compose obviously does. CI runners can scope builds to subdirs (`pnpm --filter ./frontend build`).

There's no deploy-platform reason to split.

---

## Running locally

### Run the b-dash generator (this repo)

```bash
cd B:/dash/app-generator

# Install (first time only)
pnpm install
pnpm -r build

# Run the Studio (visual builder)
pnpm --filter @b-dash/studio-app dev
# → http://localhost:3001

# OR generate an app from CLI
node packages/cli/dist/index.js generate starters/observability-saas/recipe.json --out ./my-app
```

### Run a generated app

```bash
cd ./my-app

# OPTION A — Docker Compose (recommended for first run)
cp .env.example .env             # fill in real values
docker compose up -d --build
# → http://localhost:3000 (frontend)
# → http://localhost:8000 (backend API)
# → http://localhost:8000/docs (Swagger UI for FastAPI)

# OPTION B — native (two terminals)
# Terminal 1 — backend
cd backend
python -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env        # fill in values
export $(cat ../.env | xargs)     # or use a tool like direnv
alembic upgrade head              # apply DB migrations
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
pnpm install
pnpm dev                          # → http://localhost:3000
```

### Run both b-dash + a generated app in one session

Useful when iterating on a generated app + tweaking sections in the Studio at the same time:

```bash
# Terminal 1 — Studio
cd B:/dash/app-generator
pnpm --filter @b-dash/studio-app dev      # :3001

# Terminal 2 — generated backend
cd ./my-app/backend
uvicorn app.main:app --reload --port 8000  # :8000

# Terminal 3 — generated frontend
cd ./my-app/frontend
pnpm dev                                    # :3000
```

After Studio edits, click ▶ Render in Studio → it overwrites the generated tree (preserving `overrides/`) → the generated app's next-dev hot-reload picks up the changes automatically.

---

## Branching strategy

For the b-dash generator monorepo:

| Branch | Purpose |
|---|---|
| `main` | Always-deployable. Studio + catalog stable. |
| `feature/<name>` | One wave / one section batch / one feature. PR to main. |
| `release/v1.x` | Optional — if you cut versioned catalog releases customers pin to |

For generated apps:

| Branch | Purpose |
|---|---|
| `main` | Production. Auto-deploys to prod. |
| `staging` | Auto-deploys to staging. PRs merge here first. |
| `feature/*` | Per-PR work. |
| `regen/<date>` | (Optional) clean branch for big wirer regens — easier to review the diff |

---

## CI / GitHub Actions

A minimal workflow for the generator repo:

```yaml
# .github/workflows/ci.yml
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
      - name: Smoke gen
        run: node packages/cli/dist/index.js generate starters/observability-saas/recipe.json --out /tmp/smoke
```

For a generated app:

```yaml
# .github/workflows/ci.yml (inside the generated app)
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: cd frontend && pnpm install --frozen-lockfile
      - run: cd frontend && pnpm build
      - run: cd frontend && pnpm test
```

---

## Common pitfalls

| Mistake | Fix |
|---|---|
| Committed `.env` with real secrets | Rotate the secrets, then `git filter-repo` to scrub history. Add `.env` to `.gitignore` going forward. |
| Committed `node_modules/` (huge repo) | `git rm -r --cached node_modules` + push. Check `.gitignore` covers it. |
| Committed `output/` from Studio | Same as above for `output/`. The Studio runtime data isn't source code. |
| pnpm `workspace:*` deps broke after splitting frontend/backend into separate repos | Undo the split. Or replace with real npm-published versions (annoying). |
| Generated app dev server says "module not found" after `b-dash generate` | Run `pnpm install` in the generated tree's frontend/ — fresh dirs need fresh installs |
| CI says "command not found: pnpm" | Use `pnpm/action-setup@v3` step, not `npm i -g pnpm` |

---

## Quick decision: which path do you want?

> **"I just want to share this with my team"**
> → ① Push the b-dash generator repo. They run `pnpm install`, point the Studio at it.

> **"I built an app in the Studio and want to deploy it"**
> → Click ▶ Render in Studio → ② Push that generated app's tree.

> **"My team has 5 people working on different parts"**
> → Still one monorepo. Use branches + CODEOWNERS for review boundaries.

> **"My backend team is in a different company"**
> → Then split. Two repos, two CI pipelines, document the contract between them with OpenAPI.

---

## Next docs

- [LOCAL-SETUP.md](./LOCAL-SETUP.md) — first-time machine setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel/Render/Fly/Docker recipes
- [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — ready-to-paste compose layouts
- [ENV-VARS.md](./ENV-VARS.md) — every env var across all modules
- [USER-MANUAL.md](./USER-MANUAL.md) — Studio user guide (for non-tech users)
