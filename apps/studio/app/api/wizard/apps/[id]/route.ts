/**
 * Read or save a single wizard app's recipe.
 *
 * GET  /api/wizard/apps/<id>          → returns the full recipe.json
 * POST /api/wizard/apps/<id>/edit     → updates branding/sections/modules
 *                                      and re-runs the wirer in place.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }

function safeId(id: string): string | null {
  if (!/^wizard-[a-z0-9-]+$/i.test(id)) return null
  return id
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const recipePath = resolve(OUTPUT_DIR, id, 'recipe.json')
  try {
    const recipe = JSON.parse(await readFile(recipePath, 'utf-8'))
    return NextResponse.json({ id, recipe, outDir: resolve(OUTPUT_DIR, id) })
  } catch (err) {
    return NextResponse.json({ error: `Cannot read recipe: ${(err as Error).message}` }, { status: 404 })
  }
}

/** PATCH the recipe in place + re-run the wirer to regenerate the app. */
export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const outDir = resolve(OUTPUT_DIR, id)
  const recipePath = resolve(outDir, 'recipe.json')

  let recipe: Record<string, unknown>
  try {
    recipe = JSON.parse(await readFile(recipePath, 'utf-8'))
  } catch (err) {
    return NextResponse.json({ error: `Cannot read recipe: ${(err as Error).message}` }, { status: 404 })
  }

  const patch = (await req.json()) as {
    branding?: { name?: string; tagline?: string; primary?: string }
    sections?: string[]
    modules?: string[]
    /** Theme pack id (e.g. "aurora", "mono"). */
    theme?: string
  }

  if (patch.branding) {
    const b = (recipe.branding ?? {}) as Record<string, unknown>
    if (patch.branding.name !== undefined) b.name = patch.branding.name
    if (patch.branding.tagline !== undefined) b.tagline = patch.branding.tagline
    if (patch.branding.primary !== undefined) b.primary = patch.branding.primary
    recipe.branding = b
  }
  if (Array.isArray(patch.sections)) recipe.sections = patch.sections
  if (Array.isArray(patch.modules)) {
    recipe.modules = patch.modules.map((mid) => ({ id: mid, version: '1.0.0', config: {} }))
  }
  if (typeof patch.theme === 'string' && patch.theme.length > 0) {
    const t = (recipe.theme ?? {}) as Record<string, unknown>
    t.pack = patch.theme
    recipe.theme = t
  }

  // Write synthesised recipe to a temp file in the same dir + run wirer.
  const tempRecipePath = resolve(outDir, 'recipe.edited.json')
  await writeFile(tempRecipePath, JSON.stringify(recipe, null, 2), 'utf-8')

  const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
  const lines: string[] = []
  const exitCode = await new Promise<number>((res) => {
    const child = spawn('node', [cli, 'generate', tempRecipePath, '--out', outDir], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })

  return NextResponse.json({
    ok: exitCode === 0,
    exitCode,
    outDir,
    log: lines,
  })
}
