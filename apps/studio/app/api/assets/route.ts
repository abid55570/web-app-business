/**
 * S5a — asset library backend.
 *
 * - GET /api/assets    → list uploaded assets (id, filename, url, meta)
 * - POST /api/assets   → multipart upload, returns asset record
 * - DELETE /api/assets?id=… → remove an asset
 *
 * Storage: local filesystem under `<project>/output/studio-assets/`. The
 * Studio app serves them via Next.js public-folder convention by sym-linking
 * the upload dir or proxying via /api/assets/file/:id. For dev simplicity
 * we serve via the same handler with action=file.
 *
 * S5b will swap the FS backend for S3/R2/etc behind a configurable
 * `STUDIO_ASSETS_BACKEND` env var.
 */
import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'

const ASSETS_DIR = resolve(process.cwd(), '..', '..', 'output', 'studio-assets')

async function ensureDir() {
  await mkdir(ASSETS_DIR, { recursive: true })
}

export async function GET(req: Request) {
  await ensureDir()
  const url = new URL(req.url)
  if (url.searchParams.get('action') === 'file') {
    const id = url.searchParams.get('id')
    if (!id) return new NextResponse('missing id', { status: 400 })
    try {
      const buf = await readFile(resolve(ASSETS_DIR, id))
      return new NextResponse(buf, {
        headers: { 'content-type': guessMime(id) },
      })
    } catch {
      return new NextResponse('not found', { status: 404 })
    }
  }
  const entries = await readdir(ASSETS_DIR).catch(() => [])
  const assets = await Promise.all(
    entries.map(async (name) => {
      const s = await stat(resolve(ASSETS_DIR, name))
      return {
        id: name,
        filename: name,
        url: `/api/assets?action=file&id=${encodeURIComponent(name)}`,
        sizeBytes: s.size,
        uploadedAt: s.mtimeMs,
      }
    }),
  )
  return NextResponse.json({ assets })
}

export async function POST(req: Request) {
  await ensureDir()
  const fd = await req.formData()
  const file = fd.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })
  const safe = String(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')
  const id = `${Date.now()}-${safe}`
  const buf = Buffer.from(await file.arrayBuffer())
  await writeFile(resolve(ASSETS_DIR, id), buf)
  return NextResponse.json({
    id,
    filename: safe,
    url: `/api/assets?action=file&id=${encodeURIComponent(id)}`,
    sizeBytes: buf.length,
  })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  try {
    await unlink(resolve(ASSETS_DIR, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 })
  }
}

function guessMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'gif': return 'image/gif'
    case 'svg': return 'image/svg+xml'
    case 'webp': return 'image/webp'
    case 'mp4': return 'video/mp4'
    case 'pdf': return 'application/pdf'
    default: return 'application/octet-stream'
  }
}
