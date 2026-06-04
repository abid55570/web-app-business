/**
 * GET /api/sections/catalog
 *
 * Studio v2 visual palette feed — section catalog grouped by category
 * with thumbnail URLs. Distinct from the legacy `/api/sections` which
 * the v1 editor still uses.
 *
 * Reads sections/<cat>/<id>/section.yaml off disk. Cached in memory for
 * 60s so repeated palette renders don't re-walk the tree.
 */
import { NextResponse } from 'next/server'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const SECTIONS_DIR = resolve(PROJECT_ROOT, 'sections')

type Section = {
  id: string
  displayName: string
  description: string
  category: string
  tags: string[]
  thumbnail: string
  propCount: number
}

let cache: { at: number; data: { categories: { key: string; label: string; sections: Section[] }[]; total: number } } | null = null
const TTL_MS = 60_000

const CATEGORY_LABELS: Record<string, string> = {
  hero: '🎯 Heroes',
  features: '✨ Features',
  pricing: '💰 Pricing',
  cta: '👉 Calls to action',
  footer: '⬇ Footers',
  header: '⬆ Headers',
  testimonials: '⭐ Testimonials',
  logos: '🏢 Logos',
  faq: '❓ FAQ',
  gallery: '🖼 Galleries',
  stats: '📊 Stats',
  team: '👥 Team',
  content: '📝 Content',
  forms: '✍ Forms',
  comparison: '⚖ Comparison',
  banner: '📢 Banners',
  newsletter: '📧 Newsletter',
  timeline: '⏱ Timelines',
  process: '🔄 Process',
  quote: '💬 Quotes',
  divider: '➖ Dividers',
  breadcrumb: '🍞 Breadcrumbs',
  sidebar: '◧ Sidebars',
  error: '⚠ Error pages',
  empty: '🗋 Empty states',
  table: '⊞ Tables',
  loading: '⌛ Loading',
  'coming-soon': '🚀 Coming soon',
  notice: '🔔 Notices',
  contact: '✉ Contact',
  download: '⬇ Downloads',
  blog: '📰 Blog',
  product: '🛍 Product',
  profile: '👤 Profile',
  feedback: '💭 Feedback',
  layout: '⊟ Layout',
  metric: '📈 Metrics',
  maps: '🗺 Maps',
  charts: '📉 Charts',
  modal: '⬛ Modals',
  nav: '☰ Navigation',
  onboarding: '🎓 Onboarding',
  search: '🔎 Search',
  '3d': '⬢ 3D scenes',
  illustration: '🎨 Illustrations',
}

async function readCatalog() {
  let cats
  try {
    cats = (await readdir(SECTIONS_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  } catch {
    return { categories: [], total: 0 }
  }

  const categories: { key: string; label: string; sections: Section[] }[] = []
  let total = 0

  for (const cat of cats) {
    const catPath = resolve(SECTIONS_DIR, cat)
    let entries
    try {
      entries = (await readdir(catPath, { withFileTypes: true })).filter((e) => e.isDirectory())
    } catch {
      continue
    }
    const sections: Section[] = []
    for (const ent of entries) {
      const yamlPath = resolve(catPath, ent.name, 'section.yaml')
      try {
        const raw = await readFile(yamlPath, 'utf-8')
        const m = parseYaml(raw) as Record<string, unknown>
        const id = String(m.id ?? ent.name)
        const props = (m.props ?? {}) as Record<string, unknown>
        sections.push({
          id,
          displayName: String(m.displayName ?? id),
          description: m.description
            ? String(m.description).split('\n').filter(Boolean)[0]!.slice(0, 200)
            : '',
          category: cat,
          tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
          thumbnail: `/api/sections/thumbnail/${id}`,
          propCount: Object.keys(props).length,
        })
      } catch {
        // skip unparseable
      }
    }
    if (sections.length > 0) {
      sections.sort((a, b) => a.displayName.localeCompare(b.displayName))
      categories.push({ key: cat, label: CATEGORY_LABELS[cat] ?? cat, sections })
      total += sections.length
    }
  }

  return { categories, total }
}

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) {
    return NextResponse.json(cache.data)
  }
  const data = await readCatalog()
  cache = { at: now, data }
  return NextResponse.json(data)
}
