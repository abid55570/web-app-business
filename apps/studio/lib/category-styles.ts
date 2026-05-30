/**
 * Per-category visual mapping for the schematic canvas preview.
 * Each category gets a swatch color + a wireframe template the canvas
 * uses to render an approximate block shape.
 *
 * The schematic preview is a stand-in until S5a swaps in Puck's
 * real component rendering. It gives users a sense of block weight +
 * layout without us having to bundle 513 section components into the
 * studio dev build.
 */
export type CategoryStyle = {
  swatch: string
  hint: string
  template: 'hero' | 'grid' | 'list' | 'band' | 'card' | 'inline' | 'media'
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  hero: { swatch: '#6366f1', hint: '🎯', template: 'hero' },
  features: { swatch: '#06b6d4', hint: '✨', template: 'grid' },
  pricing: { swatch: '#a855f7', hint: '💰', template: 'grid' },
  cta: { swatch: '#ec4899', hint: '👉', template: 'band' },
  footer: { swatch: '#52525b', hint: '⬇', template: 'band' },
  header: { swatch: '#0ea5e9', hint: '⬆', template: 'band' },
  testimonials: { swatch: '#facc15', hint: '⭐', template: 'card' },
  logos: { swatch: '#71717a', hint: '🏢', template: 'inline' },
  faq: { swatch: '#22c55e', hint: '❓', template: 'list' },
  gallery: { swatch: '#f97316', hint: '🖼', template: 'grid' },
  stats: { swatch: '#14b8a6', hint: '📊', template: 'inline' },
  team: { swatch: '#8b5cf6', hint: '👥', template: 'grid' },
  content: { swatch: '#475569', hint: '📝', template: 'list' },
  forms: { swatch: '#0891b2', hint: '✍', template: 'card' },
  comparison: { swatch: '#d97706', hint: '⚖', template: 'grid' },
  banner: { swatch: '#ef4444', hint: '📢', template: 'band' },
  newsletter: { swatch: '#3b82f6', hint: '📧', template: 'card' },
  timeline: { swatch: '#a16207', hint: '⏱', template: 'list' },
  process: { swatch: '#0d9488', hint: '🔄', template: 'list' },
  quote: { swatch: '#7c3aed', hint: '💬', template: 'card' },
  divider: { swatch: '#a1a1aa', hint: '➖', template: 'inline' },
  breadcrumb: { swatch: '#64748b', hint: '🍞', template: 'inline' },
  sidebar: { swatch: '#525252', hint: '◧', template: 'band' },
  error: { swatch: '#dc2626', hint: '⚠', template: 'hero' },
  empty: { swatch: '#94a3b8', hint: '🗋', template: 'hero' },
  table: { swatch: '#374151', hint: '⊞', template: 'list' },
  loading: { swatch: '#e5e7eb', hint: '⌛', template: 'inline' },
  'coming-soon': { swatch: '#0369a1', hint: '🚀', template: 'hero' },
  notice: { swatch: '#eab308', hint: '🔔', template: 'inline' },
  contact: { swatch: '#0284c7', hint: '✉', template: 'card' },
  download: { swatch: '#16a34a', hint: '⬇', template: 'card' },
  blog: { swatch: '#9333ea', hint: '📰', template: 'list' },
  product: { swatch: '#db2777', hint: '🛍', template: 'card' },
  profile: { swatch: '#2563eb', hint: '👤', template: 'card' },
  feedback: { swatch: '#65a30d', hint: '💭', template: 'card' },
  layout: { swatch: '#737373', hint: '⊟', template: 'band' },
  metric: { swatch: '#0e7490', hint: '📈', template: 'inline' },
  maps: { swatch: '#15803d', hint: '🗺', template: 'media' },
  charts: { swatch: '#1e40af', hint: '📉', template: 'media' },
  modal: { swatch: '#7e22ce', hint: '⬛', template: 'card' },
  nav: { swatch: '#1d4ed8', hint: '☰', template: 'band' },
  onboarding: { swatch: '#059669', hint: '🎓', template: 'list' },
  search: { swatch: '#6d28d9', hint: '🔎', template: 'inline' },
  '3d': { swatch: '#a21caf', hint: '⬢', template: 'media' },
  illustration: { swatch: '#be185d', hint: '🎨', template: 'media' },
}

export function getCategoryStyle(cat: string): CategoryStyle {
  return (
    CATEGORY_STYLES[cat] ?? {
      swatch: '#71717a',
      hint: '▢',
      template: 'card',
    }
  )
}
