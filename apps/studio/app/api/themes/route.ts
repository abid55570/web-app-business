/**
 * GET /api/themes
 *
 * Lists every theme pack under <repo>/themes/<id>/theme.yaml with the
 * fields Studio v2's toolbar swatcher needs: id, displayName, category,
 * description, accent (for the preview chip). Cached 60s in-memory.
 */
import { NextResponse } from 'next/server'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const THEMES_DIR = resolve(PROJECT_ROOT, 'themes')

type Theme = {
  id: string
  displayName: string
  category: string
  description: string
  /** Accent hex for the preview chip — pulled from tokens.json. */
  accent: string
  /** Optional secondary accent. */
  accent2?: string
}

let cache: { at: number; data: { themes: Theme[]; total: number } } | null = null
const TTL_MS = 60_000

async function loadTokens(themeId: string): Promise<{ accent?: string; accent2?: string }> {
  try {
    const raw = await readFile(resolve(THEMES_DIR, themeId, 'tokens.json'), 'utf-8')
    const json = JSON.parse(raw) as { colors?: Record<string, string | { 500?: string; DEFAULT?: string }> }
    const colors = json.colors ?? {}
    // Prefer primary.500 / primary / brand.500 etc.
    const pick = (key: string): string | undefined => {
      const c = colors[key]
      if (!c) return undefined
      if (typeof c === 'string') return c
      return c['500'] ?? c.DEFAULT
    }
    return {
      accent: pick('primary') ?? pick('brand') ?? pick('accent') ?? '#6366f1',
      accent2: pick('secondary') ?? pick('accent') ?? undefined,
    }
  } catch {
    return { accent: '#6366f1' }
  }
}

async function loadTheme(themeId: string): Promise<Theme | null> {
  try {
    const raw = await readFile(resolve(THEMES_DIR, themeId, 'theme.yaml'), 'utf-8')
    const y = parseYaml(raw) as { id?: string; displayName?: string; category?: string; description?: string }
    if (!y.id) return null
    const tokens = await loadTokens(themeId)
    return {
      id: y.id,
      displayName: y.displayName ?? y.id,
      category: y.category ?? 'other',
      description: (y.description ?? '').slice(0, 160),
      accent: tokens.accent ?? '#6366f1',
      accent2: tokens.accent2,
    }
  } catch {
    return null
  }
}

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) return NextResponse.json(cache.data)
  let dirs
  try {
    dirs = (await readdir(THEMES_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  } catch {
    return NextResponse.json({ themes: [], total: 0 })
  }
  const themes = (await Promise.all(dirs.map(loadTheme))).filter((t): t is Theme => !!t)
  const data = { themes, total: themes.length }
  cache = { at: now, data }
  return NextResponse.json(data)
}
