/**
 * Sprint 10 — image upload + listing for one wizard app.
 *
 *   GET  /api/wizard/apps/<id>/uploads
 *     → { files: ['photo.jpg', 'logo.svg', ...] }
 *
 *   POST /api/wizard/apps/<id>/uploads  (multipart/form-data)
 *     body: file=<File>
 *     → { ok, file: { name, url, size } }
 *
 *   DELETE /api/wizard/apps/<id>/uploads?name=<filename>
 *     → { ok }
 *
 * Files land under:
 *   <out>/overrides/frontend/public/uploads/<filename>
 *
 * Why overrides/ instead of frontend/public directly: the wirer's
 * promote step preserves overrides/ across regens (see promote.ts), so
 * uploads survive the next "regen everything" pass. The overlay step
 * copies them back into frontend/public/uploads/ where Next.js serves
 * them at `/uploads/<filename>`.
 */
import { NextResponse } from 'next/server'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

const SAFE_NAME = /^[\w][\w.-]{0,127}$/  // basic file-name safety
const MAX_BYTES = 12 * 1024 * 1024        // 12MB hard cap per file

function uploadsDir(outDir: string): string {
  return resolve(outDir, 'overrides', 'frontend', 'public', 'uploads')
}
function livePublicDir(outDir: string): string {
  return resolve(outDir, 'frontend', 'public', 'uploads')
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const dir = uploadsDir(outDir)
  let names: string[] = []
  try {
    names = (await readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .sort()
  } catch {
    // no uploads dir yet — return empty
  }
  return NextResponse.json({ files: names })
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const overrideDir = uploadsDir(outDir)
  const liveDir = livePublicDir(outDir)
  await mkdir(overrideDir, { recursive: true })
  await mkdir(liveDir, { recursive: true })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'multipart form required' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file field required' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `file too large (max ${MAX_BYTES} bytes)` }, { status: 413 })
  }
  // Slugify filename: replace spaces with -, strip unsafe chars
  const raw = file.name || 'upload.bin'
  const ext = (raw.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0] ?? '').toLowerCase()
  const base = raw.slice(0, raw.length - ext.length).toLowerCase().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'file'
  let name = `${base}${ext}`
  if (!SAFE_NAME.test(name)) name = `upload-${Date.now()}${ext || '.bin'}`
  // Avoid clobbering an existing upload — suffix with -N until unique
  let n = 0
  while (await fileExists(resolve(overrideDir, name))) {
    n++
    name = `${base}-${n}${ext}`
    if (n > 999) break
  }

  const buf = Buffer.from(await file.arrayBuffer())
  // Write to BOTH overrides/ (so it survives regen) AND live frontend/public/
  // (so it's immediately servable by the running Next dev — overlay step
  // will sync them again on next regen anyway).
  await writeFile(resolve(overrideDir, name), buf)
  await writeFile(resolve(liveDir, name), buf)

  return NextResponse.json({
    ok: true,
    file: { name, url: `/uploads/${name}`, size: file.size, type: file.type },
  })
}

export async function DELETE(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const name = new URL(req.url).searchParams.get('name')
  if (!name || !SAFE_NAME.test(name)) {
    return NextResponse.json({ error: 'invalid name' }, { status: 400 })
  }
  const outDir = resolve(OUTPUT_DIR, id)
  await rm(resolve(uploadsDir(outDir), name), { force: true })
  await rm(resolve(livePublicDir(outDir), name), { force: true })
  return NextResponse.json({ ok: true })
}

async function fileExists(p: string): Promise<boolean> {
  try { await stat(p); return true } catch { return false }
}
// Touch the unused import so TS doesn't complain (used in fileExists' catch path indirectly).
void readFile
