/**
 * GET /api/wizard/apps/<id>/deploy-info
 *
 * Returns the deploy-ready snapshot for one app:
 *   - currentTarget: recipe.stack.deployTarget (or null)
 *   - hasDocker / hasBackend / hasDb (computed from modules)
 *   - artifacts: which deploy config files exist in outDir
 *   - cli: the shell commands a user would run to deploy
 *
 * Studio renders this in the Deploy pane so the user gets
 * actionable, target-aware guidance instead of generic docs.
 */
import { NextResponse } from 'next/server'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

async function exists(p: string): Promise<boolean> {
  try { await stat(p); return true } catch { return false }
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)

  let recipe: { stack?: { deployTarget?: string; backend?: string }; modules?: { id: string }[] } = {}
  try {
    recipe = JSON.parse(await readFile(resolve(outDir, 'recipe.json'), 'utf-8'))
  } catch {
    return NextResponse.json({ error: 'recipe not found' }, { status: 404 })
  }

  const modules = recipe.modules ?? []
  const hasDb = modules.some((m) => /^(auth-core|orders|booking|tenants|posts|user-posts|comments)/.test(m.id))
  const hasBackend = recipe.stack?.backend === 'fastapi'
  const currentTarget = recipe.stack?.deployTarget ?? null

  const artifacts = await Promise.all([
    'docker-compose.dev.yml',
    'docker-compose.yml',
    'Dockerfile',
    'vercel.json',
    'render.yaml',
    'railway.toml',
    'PRODUCTION.md',
  ].map(async (f) => ({ name: f, present: await exists(resolve(outDir, f)) })))

  return NextResponse.json({
    id,
    outDir,
    currentTarget,
    hasBackend,
    hasDb,
    artifacts,
    targets: [
      {
        id: 'docker-vps',
        label: 'Docker → VPS (cheapest)',
        icon: '🐳',
        commands: [
          `cd "${outDir}"`,
          'docker compose -f docker-compose.dev.yml up -d --build',
        ],
        notes: 'Provision any Linux VPS (Hetzner/DO/Linode), install Docker, run above. Front with Caddy/nginx for HTTPS.',
      },
      {
        id: 'vercel',
        label: 'Vercel (easiest)',
        icon: '▲',
        commands: [
          'npm i -g vercel',
          `cd "${outDir}/frontend"`,
          'vercel --prod',
          ...(hasBackend ? [
            '',
            '# Backend on Render/Railway in a second step:',
            `cd "${outDir}/backend"`,
            'render deploy   # or: railway up',
          ] : []),
        ],
        notes: hasBackend
          ? 'Vercel hosts the frontend; pair with Render or Railway for the FastAPI backend. Set NEXT_PUBLIC_API_URL on Vercel.'
          : 'Single command — your frontend-only app is live in ~30s.',
      },
      {
        id: 'render',
        label: 'Render (full-stack)',
        icon: '🎨',
        commands: [
          'open https://render.com',
          `# 1. New → Web Service → connect repo, root: ${outDir}/frontend`,
          ...(hasBackend ? [
            `# 2. New → Web Service → root: ${outDir}/backend`,
            ...(hasDb ? ['# 3. New → PostgreSQL → free plan'] : []),
          ] : []),
          `# Env vars from ${outDir}/backend/.env.production.example`,
        ],
        notes: 'Render handles both services + managed Postgres. Free tier sleeps after 15 min inactivity.',
      },
      {
        id: 'railway',
        label: 'Railway (generous free credit)',
        icon: '🚂',
        commands: [
          'npm i -g @railway/cli',
          'railway login',
          `cd "${outDir}"`,
          'railway up',
        ],
        notes: 'One CLI command to ship. Auto-detects Next.js + FastAPI. $5/mo free credit.',
      },
    ],
  })
}
