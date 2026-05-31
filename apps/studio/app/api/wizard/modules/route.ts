/**
 * Module catalog endpoint for the wizard's module-picker step.
 *
 * Scans <repo>/modules/<id>/module.yaml, parses id / displayName /
 * description / depends_on, and groups by category (derived from the
 * id prefix — auth-, payment-, notifications-, etc.).
 *
 * Returns { categories: [{ key, label, modules: [...] }] }.
 */
import { NextResponse } from 'next/server'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const MODULES_DIR = resolve(PROJECT_ROOT, 'modules')

type ModuleEntry = {
  id: string
  displayName: string
  description: string
  dependsOn: string[]
  category: string
}

/** Bucket modules into broad categories driven by id prefix. */
function categoryFor(id: string): { key: string; label: string } {
  if (id.startsWith('auth')) return { key: 'auth', label: '🔐 Authentication' }
  if (id.startsWith('payment')) return { key: 'payment', label: '💳 Payments' }
  if (id.startsWith('notifications')) return { key: 'notifications', label: '📣 Notifications' }
  if (id.startsWith('telemetry')) return { key: 'telemetry', label: '📊 Telemetry & analytics' }
  if (id.startsWith('ws')) return { key: 'realtime', label: '🔄 Realtime / WebSockets' }
  if (id.startsWith('search')) return { key: 'search', label: '🔎 Search' }
  if (id.startsWith('ai')) return { key: 'ai', label: '🧠 AI' }
  if (['tenants', 'rbac', 'audit-log', 'feature-flags', 'flags', 'backup'].includes(id)) {
    return { key: 'infra', label: '⚙ Infrastructure & admin' }
  }
  if (['orders', 'menu', 'media', 'boards'].includes(id)) {
    return { key: 'business', label: '🏪 Business / commerce' }
  }
  if (['posts', 'comments', 'likes', 'bookmarks', 'tags'].includes(id)) {
    return { key: 'content', label: '📝 Content & social' }
  }
  if (id === 'events-bus') return { key: 'core', label: '🧩 Core (always recommended)' }
  return { key: 'other', label: '✨ Other' }
}

function parseDependsOn(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((d) => (typeof d === 'string' ? d.split('@')[0]! : null))
    .filter((x): x is string => !!x)
}

async function loadModule(id: string): Promise<ModuleEntry | null> {
  try {
    const yamlPath = resolve(MODULES_DIR, id, 'module.yaml')
    const raw = await readFile(yamlPath, 'utf-8')
    const m = parseYaml(raw) as {
      id?: string
      displayName?: string
      description?: string
      depends_on?: unknown
    }
    if (!m.id) return null
    return {
      id: m.id,
      displayName: m.displayName ?? m.id,
      // Collapse multi-line YAML descriptions to one short line.
      description: (m.description ?? '').split('\n').filter(Boolean).slice(0, 2).join(' ').slice(0, 240),
      dependsOn: parseDependsOn(m.depends_on),
      category: categoryFor(m.id).key,
    }
  } catch {
    return null
  }
}

export async function GET() {
  let entries
  try {
    entries = await readdir(MODULES_DIR, { withFileTypes: true })
  } catch (err) {
    return NextResponse.json({ error: `Cannot read modules dir: ${(err as Error).message}` }, { status: 500 })
  }

  const ids = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()
  const loaded = (await Promise.all(ids.map(loadModule))).filter((x): x is ModuleEntry => !!x)

  // Group into categories — keep deterministic ordering for the UI.
  const ORDER = ['core', 'auth', 'payment', 'notifications', 'business', 'content', 'realtime', 'search', 'ai', 'telemetry', 'infra', 'other']
  const byCat = new Map<string, ModuleEntry[]>()
  for (const m of loaded) {
    const arr = byCat.get(m.category) ?? []
    arr.push(m)
    byCat.set(m.category, arr)
  }
  const categories = ORDER
    .filter((k) => byCat.has(k))
    .map((k) => {
      const label = categoryFor(byCat.get(k)![0]!.id).label
      return { key: k, label, modules: byCat.get(k)! }
    })

  return NextResponse.json({ categories, totalModules: loaded.length })
}
