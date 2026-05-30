# Playwright E2E

Specs in this directory walk a real browser against the running app —
backend on `$BACKEND_URL` (default `http://localhost:8000`), Next dev
server on `$BASE_URL` (default `http://localhost:3000`).

## One-time setup

```sh
pnpm playwright:install      # downloads Chromium binary
```

## Running locally

```sh
# Start the backend in another shell:
#   FastAPI:  uvicorn app.main:app --reload --port 8000
#   Django:   python manage.py migrate && python manage.py runserver 8000

pnpm test:e2e                # runs all specs (Next dev auto-started)
pnpm test:e2e -- --ui        # interactive runner
pnpm test:e2e -- --update-snapshots   # refresh visual baselines
```

## Specs

- `auth-flow.spec.ts` — signup form → /me read → logout (uses the
  default auth-jwt UI shipped by `auth-jwt`).
- `menu-flow.spec.ts` — admin menu CRUD via direct API; skipped unless
  `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set (we don't ship an admin
  seeder yet — Phase 3 work).

## Visual regression

Each spec can call `await expect(page).toHaveScreenshot()` to snapshot a
DOM region; baselines land under `__screenshots__/` and `--update-snapshots`
refreshes them. The `chromium` project is configured at 1280×720 by
default — add other projects in `playwright.config.ts` to test mobile
viewports.
