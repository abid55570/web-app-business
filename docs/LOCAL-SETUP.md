# Local setup

Bring the b-dash monorepo up on your machine and run the wirer + Studio.

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| **Node.js** | 20.x | LTS — anything < 20 will fail because we use the new fs Promise API |
| **pnpm** | 9.x | `npm i -g pnpm` if missing |
| **Python** | 3.11+ | Only needed when running a generated FastAPI/Django backend (not for the wirer itself) |
| **Git** | any | Optional — repo is not a git repo by default; you can `git init` whenever |

Windows users: WSL2 works, Native works. PowerShell shell-state quirks mean a few commands need `;` instead of `&&` — see notes below.

## 1 · Clone + install

```bash
git clone <repo-url> b-dash
cd b-dash/app-generator
pnpm install
```

`pnpm install` walks the workspace globs in `pnpm-workspace.yaml` and links:

- `packages/*` — schemas, wirer, cli, studio (the library)
- `apps/*` — studio (the Next.js visual editor app)
- `templates/**` — email + studio-block templates
- `modules/*` — 39 generation modules
- `themes/*` — 75 theme token sets

First install pulls ~250 MB into `node_modules/.pnpm`. Subsequent installs are fast (content-addressed store).

## 2 · Build the library packages

```bash
pnpm -r build
```

This runs `tsup`/`tsc` across all `packages/*` and produces `dist/` folders. The wirer + cli are now executable.

Quick sanity check:

```bash
pnpm -r test
```

You should see **205/205 passing** across schemas (77) · wirer (104) · studio (10) · cli (14).

## 3 · Generate your first app

```bash
node packages/cli/dist/index.js generate starters/observability-saas/recipe.json --out /tmp/my-app
```

That produces a complete Next.js + FastAPI project at `/tmp/my-app` — 137 files across 15 modules.

Available starters live under `starters/` — there are 58 of them. Notable ones:

- `saas-jwt` — B2B SaaS with email+OAuth + Stripe + transactional email
- `marketplace-india` — Razorpay + WhatsApp + COD + bank-transfer payments
- `realtime-chat` — `ws-core` multi-room chat
- `observability-saas` — Sentry + PostHog + Plausible wired together
- `subscription-saas` — Stripe subscriptions + tenants + audit + feature-flags

## 4 · Run the generated app

```bash
cd /tmp/my-app
pnpm install                    # frontend deps
cd backend && pip install -r requirements.txt  # backend deps (FastAPI starters)
# or:  poetry install
# or:  python -m venv .venv && .venv/bin/pip install -r requirements.txt

# in two shells:
cd frontend && pnpm dev         # http://localhost:3000
cd backend  && uvicorn app.main:app --reload    # http://localhost:8000
```

Django starters use `python manage.py runserver` instead of uvicorn.

## 5 · Run the Studio (visual builder)

```bash
pnpm --filter @b-dash/studio-app dev
```

Opens at **http://localhost:3001**. The Studio reads the section catalog from `sections/` at runtime — no separate build step needed when you add new sections.

## 6 · Iterate on the catalog

Add a section:

```bash
mkdir -p sections/hero/MyHero
cat > sections/hero/MyHero/section.yaml <<'YAML'
id: MyHero
displayName: "My Hero"
description: "What it does."
version: 1.0.0
category: hero
density: spacious
componentFile: ./MyHero.tsx
props:
  heading: { type: string, label: "Heading", required: true }
tags: [hero]
bestWithThemes: [minimal]
deprecated: false
YAML
# Then create MyHero.tsx exporting a `MyHero` React component.

# Verify it loads:
pnpm --filter @b-dash/wirer test
```

Add a theme: drop a new dir under `themes/<name>/` containing `theme.yaml` + `tokens.json`.

Add a module: copy any existing `modules/<id>/` as a template; the wirer auto-discovers `module.yaml` manifests at render time.

## 7 · Watch mode for development

```bash
pnpm -r --parallel dev
```

Runs `tsup --watch` in every package + Next.js dev server in the studio. Edits to schemas/wirer/studio source rebuild instantly; the studio HMR picks up component changes.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module '@b-dash/schemas'` after install | Run `pnpm -r build` once; workspace deps need a built dist/ |
| Wirer test `Test timed out in 5000ms` | Already bumped to 30s in `packages/wirer/vitest.config.ts`. If still failing, check disk speed — the section scan reads 538 yaml files |
| Studio shows "Loading section catalog…" forever | The `/api/sections` route reads from disk. Check the studio shell logs; usually a missing section.yaml in a half-created section dir |
| `pnpm install` fails with EACCES on Windows | Run terminal as administrator the first time so pnpm can create global links |
| PowerShell rejects `&&` in commands | Use `;` instead, or run from bash/zsh/Git Bash |

## Next docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — ship a generated app to Vercel/Render/Fly/Docker
- [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — full-stack Postgres + Redis + backend + frontend compose
- [ENV-VARS.md](./ENV-VARS.md) — every env var across modules + studio + wirer
