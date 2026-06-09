/**
 * Sprint 14 — GET /api/sections/variants/<id>
 *
 * Returns the `variants` array from a section's section.yaml, if defined.
 * Studio uses this to render a "Layout" dropdown in the right rail when
 * a section is selected — letting the user swap layout presets (e.g.
 * Hero3DScene: full / half / compact) without writing code.
 *
 * Response shape:
 *   { variants: [{ id, label, description }] }
 *
 * Empty array when the section doesn't expose variants. Cached 60s.
 */
import { NextResponse } from 'next/server'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const SECTIONS_DIR = resolve(PROJECT_ROOT, 'sections')

type Variant = { id: string; label: string; description?: string }
type Params = { params: Promise<{ id: string }> }

const cache = new Map<string, { at: number; data: { variants: Variant[] } }>()
const TTL_MS = 60_000

async function findSectionYaml(id: string): Promise<string | null> {
  let cats: string[]
  try {
    cats = (await readdir(SECTIONS_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    return null
  }
  for (const cat of cats) {
    const p = resolve(SECTIONS_DIR, cat, id, 'section.yaml')
    try {
      const raw = await readFile(p, 'utf-8')
      return raw
    } catch {
      // not in this category — keep looking
    }
  }
  return null
}

export async function GET(_req: Request, ctx: Params) {
  const { id } = await ctx.params
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }
  const now = Date.now()
  const hit = cache.get(id)
  if (hit && now - hit.at < TTL_MS) return NextResponse.json(hit.data)

  const raw = await findSectionYaml(id)
  if (!raw) return NextResponse.json({ variants: [] })

  let parsed: Record<string, unknown>
  try {
    parsed = parseYaml(raw) as Record<string, unknown>
  } catch {
    return NextResponse.json({ variants: [] })
  }
  const variants: Variant[] = Array.isArray(parsed.variants)
    ? (parsed.variants as Variant[]).filter((v) => v && typeof v.id === 'string' && typeof v.label === 'string')
    : []

  const data = { variants }
  cache.set(id, { at: now, data })
  return NextResponse.json(data)
}
