/**
 * Deploy-target config emitter.
 *
 * Reads `plan.resolvedRecipe.recipe.stack.deployTarget` and writes the
 * matching deploy config files into the generated output. Each target
 * has a small, minimum-viable config — enough that `vercel deploy` /
 * `render deploys create` / `docker compose up` work from a fresh
 * generation without further wiring. Customers tune via overrides.
 *
 * Targets (PLAN §11):
 *   - vercel:      vercel.json + .vercelignore
 *   - render:      render.yaml (web + db services)
 *   - railway:     railway.toml + nixpacks.toml
 *   - coolify-vps: Dockerfile + docker-compose.yml + .coolify/coolify.yml
 *   - docker-zip:  Dockerfile + docker-compose.yml + .dockerignore
 *
 * No-op when deployTarget is omitted (the default).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'


export type DeriveDeployArgs = {
  plan: WirePlan
  outputDir: string
}


export type DeployArtifact = {
  /** Relative path within outputDir. */
  relPath: string
  /** Bytes written. */
  bytes: number
}


export type DeployResult = {
  /** The target name from the recipe — null when none configured. */
  target: string | null
  /** Files written. Empty when target is null. */
  artifacts: DeployArtifact[]
}


export async function deriveDeploy(args: DeriveDeployArgs): Promise<DeployResult> {
  const recipe = args.plan.resolvedRecipe.recipe
  const target = recipe.stack.deployTarget ?? null
  if (!target) {
    return { target: null, artifacts: [] }
  }

  switch (target) {
    case 'vercel':
      return emit(args.outputDir, 'vercel', vercelFiles(recipe))
    case 'render':
      return emit(args.outputDir, 'render', renderFiles(recipe))
    case 'railway':
      return emit(args.outputDir, 'railway', railwayFiles(recipe))
    case 'coolify-vps':
      return emit(args.outputDir, 'coolify-vps', coolifyFiles(recipe))
    case 'docker-zip':
      return emit(args.outputDir, 'docker-zip', dockerFiles(recipe))
    default:
      // Future targets that the schema added but we don't emit yet.
      return { target, artifacts: [] }
  }
}


async function emit(
  outputDir: string,
  target: string,
  files: Record<string, string>,
): Promise<DeployResult> {
  const artifacts: DeployArtifact[] = []
  for (const [relPath, content] of Object.entries(files)) {
    const abs = path.join(outputDir, relPath)
    await mkdir(path.dirname(abs), { recursive: true })
    await writeFile(abs, content, 'utf-8')
    artifacts.push({ relPath, bytes: Buffer.byteLength(content, 'utf8') })
  }
  return { target, artifacts }
}


// ---- per-target generators ----

type Recipe = WirePlan['resolvedRecipe']['recipe']


function vercelFiles(recipe: Recipe): Record<string, string> {
  // Next.js is auto-detected by Vercel — vercel.json only declares
  // env + cron + rewrites. We just stub the env keys here so the
  // dashboard prompts for them on first deploy.
  const envKeys = inferEnvKeys(recipe)
  const vercelJson = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    name: recipe.id,
    framework: 'nextjs',
    buildCommand: 'pnpm --filter frontend build',
    installCommand: 'pnpm install',
    devCommand: 'pnpm --filter frontend dev',
    outputDirectory: 'frontend/.next',
    env: Object.fromEntries(envKeys.map((k) => [k, `@${k.toLowerCase()}`])),
  }
  return {
    'vercel.json': JSON.stringify(vercelJson, null, 2) + '\n',
    '.vercelignore':
      [
        'backend/',
        'prisma/',
        'overrides/',
        'tests/',
        '.b-dash-*',
        '__pycache__/',
      ].join('\n') + '\n',
  }
}


function renderFiles(recipe: Recipe): Record<string, string> {
  const envKeys = inferEnvKeys(recipe)
  const services: string[] = []
  // Web service
  services.push(
    [
      '  - type: web',
      `    name: ${recipe.id}-web`,
      '    env: node',
      '    region: oregon',
      '    plan: starter',
      '    rootDir: frontend',
      '    buildCommand: pnpm install && pnpm build',
      '    startCommand: pnpm start',
      '    envVars:',
      ...envKeys.map((k) => `      - { key: ${k}, sync: false }`),
    ].join('\n'),
  )
  // API service (when fastapi/django selected)
  services.push(
    [
      '  - type: web',
      `    name: ${recipe.id}-api`,
      '    env: python',
      '    region: oregon',
      '    plan: starter',
      '    rootDir: backend',
      '    buildCommand: pip install -e .',
      `    startCommand: ${recipe.stack.backend === 'django'
        ? 'gunicorn config.wsgi --bind 0.0.0.0:$PORT'
        : 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'}`,
      '    envVars:',
      `      - { key: DATABASE_URL, fromDatabase: { name: ${recipe.id}-db, property: connectionString } }`,
      ...envKeys
        .filter((k) => k !== 'DATABASE_URL')
        .map((k) => `      - { key: ${k}, sync: false }`),
    ].join('\n'),
  )

  const dbBlock =
    recipe.stack.database === 'sqlite'
      ? '' // sqlite needs no managed db service
      : [
          'databases:',
          `  - name: ${recipe.id}-db`,
          `    databaseName: ${recipe.id.replace(/-/g, '_')}`,
          `    user: app`,
          '    plan: starter',
          '    region: oregon',
        ].join('\n') + '\n'

  const renderYaml = ['services:', ...services].join('\n\n') + '\n\n' + dbBlock
  return { 'render.yaml': renderYaml }
}


function railwayFiles(recipe: Recipe): Record<string, string> {
  // Railway uses nixpacks for autodetect; we add a nixpacks.toml to pin
  // the runtimes + a railway.toml for the project layout.
  const railwayToml = [
    '[build]',
    'builder = "nixpacks"',
    '',
    '[deploy]',
    `restartPolicyType = "ON_FAILURE"`,
    'restartPolicyMaxRetries = 10',
    '',
    '[[services]]',
    `name = "${recipe.id}-web"`,
    'startCommand = "pnpm --filter frontend start"',
    '',
    '[[services]]',
    `name = "${recipe.id}-api"`,
    `startCommand = "${
      recipe.stack.backend === 'django'
        ? 'gunicorn config.wsgi --bind 0.0.0.0:$PORT'
        : 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'
    }"`,
  ].join('\n')

  const nixpacksToml = [
    '[phases.setup]',
    `nixPkgs = ["nodejs_20", "python311", "pnpm"]`,
    '',
    '[phases.install]',
    'cmds = ["pnpm install", "cd backend && pip install -e ."]',
    '',
    '[phases.build]',
    'cmds = ["pnpm --filter frontend build"]',
    '',
    '[start]',
    `cmd = "pnpm --filter frontend start"`,
  ].join('\n')

  return {
    'railway.toml': railwayToml + '\n',
    'nixpacks.toml': nixpacksToml + '\n',
  }
}


function coolifyFiles(recipe: Recipe): Record<string, string> {
  // Coolify deploys via docker-compose by default. We reuse the docker
  // bundle + add a coolify/coolify.yml hint file the dashboard reads.
  const dockerBundle = dockerFiles(recipe)
  return {
    ...dockerBundle,
    '.coolify/coolify.yml':
      [
        `name: ${recipe.id}`,
        `service: web`,
        `port: 3000`,
        `health_check: /healthz`,
        `auto_deploy: true`,
      ].join('\n') + '\n',
  }
}


function dockerFiles(recipe: Recipe): Record<string, string> {
  const backendBase = recipe.stack.backend === 'django' ? 'python:3.12-slim' : 'python:3.12-slim'
  const apiStart =
    recipe.stack.backend === 'django'
      ? 'gunicorn config.wsgi --bind 0.0.0.0:8000'
      : 'uvicorn app.main:app --host 0.0.0.0 --port 8000'

  const dockerfile = [
    `# syntax=docker/dockerfile:1.6`,
    `# Multi-stage: build frontend (Node) + serve API (Python) in one image.`,
    `# Production deployments usually split into two images; this is the`,
    `# minimum-viable "single box" for VPS / Coolify / docker-compose runs.`,
    ``,
    `# ---- frontend builder ----`,
    `FROM node:20-alpine AS frontend-builder`,
    `WORKDIR /app`,
    `RUN corepack enable && corepack prepare pnpm@latest --activate`,
    `COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./`,
    `COPY frontend/ ./frontend/`,
    `RUN pnpm install --frozen-lockfile=false && pnpm --filter frontend build`,
    ``,
    `# ---- backend runtime ----`,
    `FROM ${backendBase}`,
    `WORKDIR /app`,
    `RUN apt-get update && apt-get install -y --no-install-recommends \\`,
    `    nodejs npm postgresql-client \\`,
    `    && rm -rf /var/lib/apt/lists/*`,
    `RUN npm install -g pnpm@latest`,
    `COPY backend/ ./backend/`,
    `RUN cd backend && pip install --no-cache-dir -e .`,
    `COPY --from=frontend-builder /app/frontend ./frontend`,
    `COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./`,
    `EXPOSE 3000 8000`,
    `CMD ["sh", "-c", "cd backend && ${apiStart} & cd ../frontend && pnpm start"]`,
  ].join('\n')

  const dbService =
    recipe.stack.database === 'postgres'
      ? [
          '  db:',
          '    image: postgres:16-alpine',
          '    environment:',
          `      POSTGRES_DB: ${recipe.id.replace(/-/g, '_')}`,
          '      POSTGRES_USER: app',
          '      POSTGRES_PASSWORD: app',
          '    volumes: [pgdata:/var/lib/postgresql/data]',
          '    ports: ["5432:5432"]',
        ].join('\n')
      : recipe.stack.database === 'mysql'
        ? [
            '  db:',
            '    image: mysql:8',
            '    environment:',
            `      MYSQL_DATABASE: ${recipe.id.replace(/-/g, '_')}`,
            '      MYSQL_USER: app',
            '      MYSQL_PASSWORD: app',
            '      MYSQL_ROOT_PASSWORD: root',
            '    volumes: [mysqldata:/var/lib/mysql]',
            '    ports: ["3306:3306"]',
          ].join('\n')
        : ''

  const dependsBlock =
    recipe.stack.database === 'sqlite' ? '' : '    depends_on: [db]\n'

  const composeYml = [
    'services:',
    '  app:',
    '    build: .',
    '    environment:',
    `      DATABASE_URL: "${dbUrlForCompose(recipe)}"`,
    '    ports:',
    '      - "3000:3000"',
    '      - "8000:8000"',
    dependsBlock + (dbService ? '\n' + dbService : ''),
    '',
    recipe.stack.database !== 'sqlite' ? 'volumes:' : '',
    recipe.stack.database === 'postgres' ? '  pgdata: {}' : '',
    recipe.stack.database === 'mysql' ? '  mysqldata: {}' : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    Dockerfile: dockerfile + '\n',
    'docker-compose.yml': composeYml + '\n',
    '.dockerignore':
      [
        'node_modules/',
        'frontend/.next/',
        'backend/__pycache__/',
        'overrides/',
        '.b-dash-*',
        '.git/',
        'tests/',
      ].join('\n') + '\n',
  }
}


function dbUrlForCompose(recipe: Recipe): string {
  const db = recipe.stack.database
  if (db === 'postgres')
    return `postgresql://app:app@db:5432/${recipe.id.replace(/-/g, '_')}`
  if (db === 'mysql')
    return `mysql://app:app@db:3306/${recipe.id.replace(/-/g, '_')}`
  return 'sqlite:///./app.db'
}


function inferEnvKeys(recipe: Recipe): string[] {
  // Heuristic: scan module list for the well-known integration keys.
  // (Per-module env declarations exist in module.yaml.env, but we'd
  // need access to LoadedModule here. For v1, infer from module ids.)
  const ids = new Set(recipe.modules.map((m) => m.id))
  const keys: string[] = ['DATABASE_URL', 'JWT_SECRET']
  if (ids.has('payment-stripe') || ids.has('payment-stripe-subs')) {
    keys.push('STRIPE_API_KEY', 'STRIPE_WEBHOOK_SECRET')
  }
  if (ids.has('payment-stripe-subs')) {
    keys.push('STRIPE_WEBHOOK_SECRET_SUBS')
  }
  if (ids.has('payment-razorpay'))
    keys.push('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')
  if (ids.has('notifications-resend')) keys.push('RESEND_API_KEY')
  if (ids.has('notifications-twilio'))
    keys.push('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER')
  if (ids.has('notifications-whatsapp'))
    keys.push('WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN')
  if (ids.has('notifications-push'))
    keys.push('VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY')
  if (ids.has('ws-redis')) keys.push('REDIS_URL')
  if (ids.has('ai-llm')) keys.push('ANTHROPIC_API_KEY')
  if (ids.has('search-meili')) keys.push('MEILI_HOST', 'MEILI_MASTER_KEY')
  if (ids.has('auth-oauth'))
    keys.push(
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
    )
  if (ids.has('telemetry-sentry'))
    keys.push('SENTRY_DSN', 'SENTRY_ENVIRONMENT', 'SENTRY_RELEASE')
  if (ids.has('telemetry-posthog'))
    keys.push('POSTHOG_API_KEY', 'POSTHOG_HOST')
  if (ids.has('telemetry-plausible'))
    keys.push('PLAUSIBLE_DOMAIN', 'PLAUSIBLE_API_HOST')
  return [...new Set(keys)].sort()
}
