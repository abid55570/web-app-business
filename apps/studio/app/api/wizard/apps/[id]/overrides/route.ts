/**
 * Studio v2 — element-level overrides storage.
 *
 *   GET  /api/wizard/apps/<id>/overrides
 *     → returns the current studio-overrides.json for this app
 *       (or { version: 1, elements: {} } if missing).
 *
 *   POST /api/wizard/apps/<id>/overrides
 *     body: { elementId: string, patch: { text?, className? } }
 *     → merges the patch into studio-overrides.json + (by default) runs
 *       the wirer in place so the change lands in section files.
 *     Pass { regen: false } in the body to defer regeneration (Studio
 *     calls this when batching multiple inline edits).
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

type Overrides = {
  version: 1
  elements: Record<string, { text?: string; className?: string }>
}

async function readOverrides(outDir: string): Promise<Overrides> {
  try {
    const raw = await readFile(resolve(outDir, 'studio-overrides.json'), 'utf-8')
    const json = JSON.parse(raw) as Overrides
    if (json && json.version === 1 && json.elements && typeof json.elements === 'object') return json
  } catch {
    // missing or malformed — start fresh
  }
  return { version: 1, elements: {} }
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const overrides = await readOverrides(outDir)
  return NextResponse.json(overrides)
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)

  const body = (await req.json()) as {
    elementId?: string
    patch?: { text?: string; className?: string }
    /** Skip regen — useful when batching live-preview edits. */
    regen?: boolean
    /** Wipe one element back to its baked default. */
    clear?: boolean
  }

  if (!body.elementId) {
    return NextResponse.json({ error: 'elementId required' }, { status: 400 })
  }

  const overrides = await readOverrides(outDir)

  if (body.clear) {
    delete overrides.elements[body.elementId]
  } else {
    if (!body.patch || typeof body.patch !== 'object') {
      return NextResponse.json({ error: 'patch required' }, { status: 400 })
    }
    const existing = overrides.elements[body.elementId] ?? {}
    overrides.elements[body.elementId] = { ...existing, ...body.patch }
  }

  await writeFile(
    resolve(outDir, 'studio-overrides.json'),
    JSON.stringify(overrides, null, 2),
    'utf-8',
  )

  // Default: regen so the user can refresh the preview iframe and see
  // the change persist. Studio can pass { regen: false } to batch.
  if (body.regen === false) {
    return NextResponse.json({ ok: true, overrides, regenSkipped: true })
  }

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

  return NextResponse.json({
    ok: exitCode === 0,
    exitCode,
    overrides,
    log: lines.slice(-8),
  })
}
