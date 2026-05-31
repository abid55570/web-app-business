'use client'
import { useMemo, useState } from 'react'
import type { PuckBlockManifest } from '../lib/types'
import { fuzzyFilter } from '../lib/fuzzy'
import { getCategoryStyle } from '../lib/category-styles'

const RECENT_KEY = 'studio-recent-blocks'

export function Palette({
  blocks,
  onInsert,
}: {
  blocks: PuckBlockManifest[]
  onInsert: (blockId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readRecent(),
  )

  const filtered = useMemo(
    () =>
      fuzzyFilter(
        blocks.map((b) => ({
          ...b,
          tags: [],
        })),
        query,
      ),
    [blocks, query],
  )

  function handleInsert(id: string) {
    onInsert(id)
    const next = [id, ...recent.filter((x) => x !== id)].slice(0, 6)
    setRecent(next)
    if (typeof window !== 'undefined')
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  }

  // Group filtered by category, sorted.
  const byCat = new Map<string, PuckBlockManifest[]>()
  for (const b of filtered) {
    const list = byCat.get(b.category) ?? []
    list.push(b)
    byCat.set(b.category, list)
  }
  const cats = Array.from(byCat.keys()).sort()

  const recentBlocks = recent
    .map((id) => blocks.find((b) => b.id === id))
    .filter((x): x is PuckBlockManifest => !!x)

  return (
    <aside className="studio-left">
      <div className="palette-search">
        <input
          type="search"
          placeholder="Search sections… (/ to focus)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="palette-search-input"
        />
        <p className="palette-count">
          {filtered.length} of {blocks.length}
        </p>
      </div>

      {recentBlocks.length > 0 && !query ? (
        <>
          <div className="palette-cat">Recent</div>
          {recentBlocks.map((b) => (
            <PaletteItem key={`r-${b.id}`} block={b} onClick={handleInsert} />
          ))}
        </>
      ) : null}

      {cats.map((cat, i) => {
        const style = getCategoryStyle(cat)
        const items = byCat.get(cat)!.sort((a, b) => a.displayName.localeCompare(b.displayName))
        // Auto-open: when searching (show all matches) OR top 4 categories on first paint.
        const openByDefault = !!query || i < 4
        return (
          <details key={cat} className="palette-cat-group" open={openByDefault}>
            <summary className="palette-cat-summary">
              <span className="palette-cat-arrow" aria-hidden>▸</span>
              <span className="palette-cat-icon" style={{ background: style.swatch + '22', color: style.swatch }}>
                {style.hint}
              </span>
              <span className="palette-cat-name">{prettyCategoryName(cat)}</span>
              <span className="palette-cat-count">{items.length}</span>
            </summary>
            <div className="palette-cat-items">
              {items.map((b) => (
                <PaletteItem key={b.id} block={b} onClick={handleInsert} />
              ))}
            </div>
          </details>
        )
      })}
    </aside>
  )
}

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
  loading: '⌛ Loading states',
  'coming-soon': '🚀 Coming soon',
  notice: '🔔 Notices',
  contact: '✉ Contact',
  download: '⬇ Downloads',
  blog: '📰 Blog',
  product: '🛍 Product',
  profile: '👤 Profile',
  feedback: '💭 Feedback',
  layout: '⊟ Layout primitives',
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

function prettyCategoryName(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat
}

function PaletteItem({
  block,
  onClick,
}: {
  block: PuckBlockManifest
  onClick: (id: string) => void
}) {
  const style = getCategoryStyle(block.category)
  return (
    <button
      type="button"
      className="palette-item"
      title={block.description ?? ''}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-palette-block', block.id)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => onClick(block.id)}
    >
      <span
        className="palette-thumb"
        style={{ background: style.swatch + '22', color: style.swatch }}
      >
        {style.hint}
      </span>
      <span className="palette-item-name">{block.displayName}</span>
    </button>
  )
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
