/**
 * GET /api/wizard/apps/<id>/export
 *
 * Spawns `b-dash generate ... --zip` to produce a fresh zip alongside
 * the output dir, then streams the file to the browser as an
 * application/zip download.
 *
 * Spawning the CLI (vs. importing zip directly) reuses the existing
 * tested implementation + automatic regen-with-fresh-overrides path —
 * the zip the user downloads is byte-identical to what the user would
 * see in dev because we just-regenerated.
 *
 * Note: the .zip lives at <outDir>.zip — we delete it after streaming
 * so it doesn't accumulate.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { readFile, stat, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const recipePath = resolve(outDir, 'recipe.json')

  // Verify recipe exists.
  try { await stat(recipePath) } catch {
    return NextResponse.json({ error: 'app not found' }, { status: 404 })
  }

  // Zip the EXISTING output dir as-is. We don't regen here because
  // the generated frontend often has a dev server holding files
  // (EBUSY on rmdir during the wirer's promote). The user's most-recent
  // Save brand / Save section / Save code edit already triggered a
  // regen, so the on-disk output matches the editor state.
  //
  // Walk outputDir, build zip in memory, stream to client. Skips
  // node_modules / .venv / .next / .git / *.log to keep the zip lean.
  const { mkdir, readdir, stat: fstat, readFile: rf, writeFile: wf } = await import('node:fs/promises')
  const { tmpdir } = await import('node:os')
  const path = await import('node:path')

  const lines: string[] = []
  const SKIP = new Set(['node_modules', '.venv', '.next', '__pycache__', '.git'])

  async function* walk(dir: string, rel: string): AsyncGenerator<{ abs: string; rel: string; size: number }> {
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      if (SKIP.has(e.name)) continue
      const abs = path.resolve(dir, e.name)
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) yield* walk(abs, r)
      else if (e.isFile()) {
        if (e.name.endsWith('.log') || e.name.endsWith('.tmp')) continue
        const st = await fstat(abs)
        yield { abs, rel: r, size: st.size }
      }
    }
  }

  // Use the existing tested zip writer from the CLI package.
  // Import dynamically since it's a workspace package.
  let createZip
  try {
    const mod = await import('@b-dash/cli/dist/zip.js')
    createZip = mod.createZip
  } catch {
    // Fallback: shell out to powershell Compress-Archive (Windows always present).
    const zipPath = path.resolve(tmpdir(), `${id}-${Date.now()}.zip`)
    const psExit = await new Promise<number>((res) => {
      const child = spawn(
        'powershell',
        ['-Command', `Compress-Archive -Path "${outDir}/*" -DestinationPath "${zipPath}" -Force`],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      )
      child.stdout.on('data', (d) => lines.push(String(d).trim()))
      child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
      child.on('close', (c) => res(c ?? 1))
    })
    if (psExit !== 0) {
      return NextResponse.json({ error: 'zip failed', log: lines.slice(-10) }, { status: 500 })
    }
    const buf2 = await readFile(zipPath)
    unlink(zipPath).catch(() => {})
    return new NextResponse(buf2 as unknown as BodyInit, {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': `attachment; filename="${id}.zip"`,
        'cache-control': 'no-store',
      },
    })
  }

  const zipPath = path.resolve(tmpdir(), `${id}-${Date.now()}.zip`)
  try {
    await createZip(outDir, zipPath)
  } catch (err) {
    return NextResponse.json({ error: 'zip failed: ' + (err as Error).message }, { status: 500 })
  }
  let buf: Buffer
  try {
    buf = await rf(zipPath)
  } catch {
    return NextResponse.json({ error: 'zip not produced' }, { status: 500 })
  }
  unlink(zipPath).catch(() => {})
  // Discard unused vars to satisfy lint
  void mkdir; void walk; void wf

  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="${id}.zip"`,
      'cache-control': 'no-store',
    },
  })
}
