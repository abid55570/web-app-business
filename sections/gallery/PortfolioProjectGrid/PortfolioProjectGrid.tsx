'use client'
import { motion } from 'framer-motion'

export type PortfolioProjectGridProps = {
  eyebrow?: string
  headline: string
  accentColor?: string
  /** Secondary brand color (placeholder gradient middle stop). */
  accentColor2?: string
  /** Tertiary brand color (placeholder gradient end stop). */
  accentColor3?: string
  projects: {
    title: string
    client: string
    tags: string[]
    year: string
    href: string
    imageUrl?: string
  }[]
}

export function PortfolioProjectGrid({
  eyebrow,
  headline,
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
  projects,
}: PortfolioProjectGridProps) {
  return (
    <section className="relative overflow-hidden bg-black py-32 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto mb-14 max-w-5xl px-6 text-center"
      >
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-4xl font-bold leading-tight md:text-5xl">{headline}</h2>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <motion.a
            key={i}
            href={p.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -8 }}
            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          >
            {/* Image / placeholder area */}
            <div
              className="aspect-[4/3] w-full overflow-hidden"
              style={{
                background: p.imageUrl
                  ? `url(${p.imageUrl}) center/cover`
                  : `linear-gradient(135deg, ${accentColor}33, ${accentColor2}33, ${accentColor3}33)`,
              }}
            >
              <div
                aria-hidden
                className="h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)`,
                }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
                <span>{p.client}</span>
                <span>·</span>
                <span>{p.year}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold transition group-hover:translate-x-1" style={{ color: '#fff' }}>
                {p.title} →
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: accentColor + '20', color: accentColor }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
