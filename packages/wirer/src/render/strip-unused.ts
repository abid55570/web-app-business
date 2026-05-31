/**
 * Strip files the generated app does not actually need.
 *
 * Triggered when `recipe.sections` is set (wizard-mode export). The
 * scaffold ships an opinionated baseline (shadcn components, API client,
 * test harnesses, lint config) which is great for hand-coded apps but
 * pure dead weight for a wizard-built static page.
 *
 * Two passes:
 *  1. Always (when sections set): remove components/ui, lib/api, tests,
 *     playwright/vitest configs, eslintrc, .studio.json section siblings,
 *     pre-baked pnpm-lock.
 *  2. When no server-side module survives the merge: remove the entire
 *     backend tree, prisma schema, run-backend scripts, the workspace
 *     entry that points at backend.
 *
 * Also slims package.json — drops dev deps for tooling we stripped and
 * runtime deps the chosen sections don't import.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type StripUnusedArgs = {
  plan: WirePlan
  outputDir: string
}

/** Modules that touch the server (need backend scaffolding). */
const SERVER_SIDE_PREFIXES = [
  'auth-', 'payment-', 'orders', 'booking', 'cart', 'search-',
  'ai-', 'storage-', 'webhook', 'cron', 'queue', 'ws-',
  'tenants', 'rbac-', 'audit-', 'backup',
]
/** Modules that touch the database (need prisma). */
const DB_PREFIXES = ['auth-core', 'orders', 'booking', 'tenants', 'rbac', 'audit-log']

function isServerSide(moduleId: string): boolean {
  return SERVER_SIDE_PREFIXES.some((p) => moduleId.startsWith(p))
}
function needsDb(moduleId: string): boolean {
  return DB_PREFIXES.some((p) => moduleId.startsWith(p))
}

async function rmIfExists(p: string): Promise<boolean> {
  try {
    await rm(p, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

/**
 * Slim package.json — keep only the deps the chosen sections + base
 * Next + Tailwind plumbing actually need. Dev deps for stripped tooling
 * (playwright, vitest, eslint plugins) get dropped too.
 */
async function slimPackageJson(frontendDir: string): Promise<void> {
  const pkgPath = path.join(frontendDir, 'package.json')
  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
  } catch {
    return
  }

  // Minimum runtime to render any of our sections: Next + React +
  // Tailwind. Sections themselves use only HTML + Tailwind classes —
  // no react-hook-form, no zod, no sonner.
  const KEEP_DEPS = new Set(['next', 'react', 'react-dom'])
  // Tailwind is a devDep in v3 — keep along with PostCSS pipeline.
  const KEEP_DEV = new Set([
    '@types/node', '@types/react', '@types/react-dom',
    'autoprefixer', 'postcss', 'tailwindcss', 'typescript',
  ])

  const deps = (pkg.dependencies ?? {}) as Record<string, string>
  const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>
  pkg.dependencies = Object.fromEntries(
    Object.entries(deps).filter(([k]) => KEEP_DEPS.has(k)),
  )
  pkg.devDependencies = Object.fromEntries(
    Object.entries(devDeps).filter(([k]) => KEEP_DEV.has(k)),
  )

  // Drop scripts that reference tools we removed.
  const scripts = (pkg.scripts ?? {}) as Record<string, string>
  pkg.scripts = {
    dev: scripts.dev ?? 'next dev --port 3000',
    build: scripts.build ?? 'next build',
    start: scripts.start ?? 'next start --port 3000',
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}

/**
 * Find every `*.studio.json` under frontend/src/sections and delete it.
 * These are Studio-only metadata — the runtime page doesn't import them.
 */
async function stripStudioManifests(sectionsRoot: string): Promise<void> {
  const { readdir } = await import('node:fs/promises')
  let entries
  try {
    entries = await readdir(sectionsRoot, { withFileTypes: true })
  } catch {
    return
  }
  for (const dir of entries.filter((e) => e.isDirectory())) {
    const dirPath = path.join(sectionsRoot, dir.name)
    let files
    try {
      files = await readdir(dirPath)
    } catch {
      continue
    }
    for (const f of files) {
      if (f.endsWith('.studio.json')) {
        await rm(path.join(dirPath, f), { force: true })
      }
    }
  }
}

export async function stripUnused(args: StripUnusedArgs): Promise<{
  strippedBackend: boolean
  filesRemoved: number
}> {
  const recipe = args.plan.resolvedRecipe.recipe as {
    sections?: string[]
    modules?: Array<{ id: string }>
  }
  // Only strip in wizard mode. If recipe.sections isn't set, this was a
  // hand-authored recipe and the operator wants the full scaffold.
  if (!Array.isArray(recipe.sections) || recipe.sections.length === 0) {
    return { strippedBackend: false, filesRemoved: 0 }
  }

  const frontendDir = path.join(args.outputDir, 'frontend')
  let removed = 0

  // ── Frontend bloat removal ────────────────────────────────────
  // Sections never import these — confirmed by grep across the catalog.
  const FRONTEND_BLOAT = [
    'src/components',         // shadcn UI primitives, unused by sections
    'src/lib/api',            // backend API client
    'src/lib/types.ts',       // module type stubs
    'src/lib/utils.ts',       // cn() helper, sections use raw classes
    'tests',                  // pre-cooked e2e specs for modules NOT shipped
    'playwright.config.ts',
    'vitest.config.ts',
    '.eslintrc.json',
    'pnpm-lock.yaml',         // regenerated locally on first install
    '.env.example',           // only useful when modules export env vars
  ]
  for (const rel of FRONTEND_BLOAT) {
    if (await rmIfExists(path.join(frontendDir, rel))) removed++
  }

  // Remove now-empty src/lib/ dir.
  await rmIfExists(path.join(frontendDir, 'src/lib'))

  // Studio metadata siblings.
  await stripStudioManifests(path.join(frontendDir, 'src/sections'))

  // Slim package.json.
  await slimPackageJson(frontendDir)

  // ── Backend / prisma removal ──────────────────────────────────
  const modules = recipe.modules ?? []
  const hasServerSide = modules.some((m) => isServerSide(m.id))
  const hasDbModule = modules.some((m) => needsDb(m.id))

  let strippedBackend = false
  if (!hasServerSide) {
    // No module exposes server routes. Strip the entire backend tree —
    // FastAPI scaffold, tests, env, README. Also drop the run-backend.*
    // scripts and the workspace entry that points at backend/.
    if (await rmIfExists(path.join(args.outputDir, 'backend'))) {
      removed++
      strippedBackend = true
    }
    await rmIfExists(path.join(args.outputDir, 'run-backend.bat'))
    await rmIfExists(path.join(args.outputDir, 'run-backend.sh'))

    // Rewrite pnpm-workspace.yaml to drop the backend entry.
    const wsPath = path.join(args.outputDir, 'pnpm-workspace.yaml')
    try {
      await writeFile(wsPath, 'packages:\n  - frontend\n', 'utf-8')
    } catch {
      // ignore
    }
  }
  if (!hasDbModule) {
    if (await rmIfExists(path.join(args.outputDir, 'prisma'))) removed++
  }

  // Always emit a docker-compose.dev.yml at the output root — one-command
  // local stack for users who don't want to manage Node + Python venvs.
  // For frontend-only static exports, it's just one frontend service.
  // For full-stack apps, it includes backend + Postgres + Redis.
  // Use the recipe id (stable across renders) rather than the temp-dir
  // basename, which would change every regen and confuse docker-compose.
  const projectName = (args.plan.resolvedRecipe.recipe.id ?? 'app').replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const composeContent = strippedBackend
    ? frontendOnlyCompose(projectName)
    : fullStackCompose(projectName, hasDbModule)
  await writeFile(
    path.join(args.outputDir, 'docker-compose.dev.yml'),
    composeContent,
    'utf-8',
  )

  return { strippedBackend, filesRemoved: removed }
}

function frontendOnlyCompose(appName: string): string {
  return `# Local dev stack for ${appName} (frontend only — no backend modules selected).
# Run: docker compose -f docker-compose.dev.yml up --build
services:
  frontend:
    build:
      context: ./frontend
      dockerfile_inline: |
        FROM node:20-alpine
        WORKDIR /app
        RUN npm install -g pnpm
        COPY package.json ./
        RUN pnpm install
        COPY . .
        EXPOSE 3000
        CMD ["pnpm", "dev"]
    ports: ["3000:3000"]
    volumes:
      - ./frontend:/app
      - /app/node_modules
`
}

function fullStackCompose(appName: string, withDb: boolean): string {
  const dbBlock = withDb
    ? `  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: ${appName.replace(/[^a-z0-9]/gi, '_')}
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
`
    : ''
  const dbDep = withDb ? '\n    depends_on: [postgres]' : ''
  return `# Full local dev stack for ${appName}.
# Run: docker compose -f docker-compose.dev.yml up --build
services:
${dbBlock}  backend:
    build:
      context: ./backend
      dockerfile_inline: |
        FROM python:3.11-slim
        WORKDIR /app
        COPY pyproject.toml ./
        RUN pip install -e ".[dev]"
        COPY . .
        EXPOSE 8000
        CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]
    ports: ["8000:8000"]${dbDep}
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: ${withDb ? `postgresql://app:app@postgres/${appName.replace(/[^a-z0-9]/gi, '_')}` : 'sqlite:///./app.db'}
  frontend:
    build:
      context: ./frontend
      dockerfile_inline: |
        FROM node:20-alpine
        WORKDIR /app
        RUN npm install -g pnpm
        COPY package.json ./
        RUN pnpm install
        COPY . .
        EXPOSE 3000
        CMD ["pnpm", "dev"]
    ports: ["3000:3000"]
    depends_on: [backend]
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
${withDb ? '\nvolumes:\n  pgdata:\n' : ''}`
}
