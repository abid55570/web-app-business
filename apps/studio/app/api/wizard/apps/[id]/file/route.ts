/**
 * GET  /api/wizard/apps/<id>/file?path=<rel>
 *   → returns { content, isOverride, originalContent? }
 *     If an override exists, returns IT (what user sees + edits).
 *     originalContent is the baked file (so Studio can show a diff).
 *
 * POST /api/wizard/apps/<id>/file?path=<rel>
 *   body: { content: string }
 *   → writes to <out>/overrides/<rel> so wirer's overlay step keeps
 *     the user's edit across regens. Triggers regen by default; pass
 *     { regen: false } to defer.
 *
 * DELETE /api/wizard/apps/<id>/file?path=<rel>
 *   → removes the override file (reverts to baked default).
 *
 * Path safety: must be relative, no .. segments, must live under
 * backend/, frontend/, prisma/, or recipe.json. Anything else = 400.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

const ALLOWED_PREFIXES = ['backend/', 'frontend/', 'prisma/']

function safePath(p: string | null): string | null {
  if (!p) return null
  // No .., no absolute, no backslashes (force POSIX).
  if (p.includes('..') || p.startsWith('/') || p.startsWith('\\') || /[A-Za-z]:[\\/]/.test(p)) return null
  const norm = p.replace(/\\/g, '/')
  if (!ALLOWED_PREFIXES.some((pfx) => norm.startsWith(pfx)) && norm !== 'recipe.json') return null
  return norm
}

async function exists(p: string): Promise<boolean> {
  try { await stat(p); return true } catch { return false }
}

export async function GET(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const path = safePath(new URL(req.url).searchParams.get('path'))
  if (!path) return NextResponse.json({ error: 'invalid path' }, { status: 400 })

  const outDir = resolve(OUTPUT_DIR, id)
  const overridePath = resolve(outDir, 'overrides', path)
  const bakedPath = resolve(outDir, path)

  let content = ''
  let isOverride = false
  if (await exists(overridePath)) {
    content = await readFile(overridePath, 'utf-8')
    isOverride = true
  } else if (await exists(bakedPath)) {
    content = await readFile(bakedPath, 'utf-8')
  } else {
    return NextResponse.json({ error: 'file not found' }, { status: 404 })
  }

  let originalContent: string | undefined
  if (isOverride && await exists(bakedPath)) {
    originalContent = await readFile(bakedPath, 'utf-8')
  }

  return NextResponse.json({ content, isOverride, originalContent })
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const path = safePath(new URL(req.url).searchParams.get('path'))
  if (!path) return NextResponse.json({ error: 'invalid path' }, { status: 400 })

  const body = (await req.json()) as { content: string; regen?: boolean }
  if (typeof body.content !== 'string') {
    return NextResponse.json({ error: 'content required' }, { status: 400 })
  }

  const outDir = resolve(OUTPUT_DIR, id)
  const overridePath = resolve(outDir, 'overrides', path)
  await mkdir(dirname(overridePath), { recursive: true })
  await writeFile(overridePath, body.content, 'utf-8')

  if (body.regen === false) {
    return NextResponse.json({ ok: true, overridePath, regenSkipped: true })
  }

  // Regen — wirer's overlay-overrides step re-applies overrides/ after
  // generation, so this file content survives the rebuild.
  const recipePath = resolve(outDir, 'recipe.json')
  const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
  const lines: string[] = []
  const exitCode = await new Promise<number>((res) => {
    const child = spawn('node', [cli, 'generate', recipePath, '--out', outDir], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })
  return NextResponse.json({ ok: exitCode === 0, exitCode, overridePath, log: lines.slice(-6) })
}

export async function DELETE(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const path = safePath(new URL(req.url).searchParams.get('path'))
  if (!path) return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const overridePath = resolve(outDir, 'overrides', path)
  try {
    await rm(overridePath)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'override not present' }, { status: 404 })
  }
}
