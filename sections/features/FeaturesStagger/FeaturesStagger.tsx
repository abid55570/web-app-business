'use client'
import { motion } from 'framer-motion'

export type FeaturesStaggerProps = {
  eyebrow?: string
  headline: string
  body?: string
  accentColor?: string
  /** Secondary brand color (second gradient orb, feature-icon gradient end). */
  accentColor2?: string
  /** Tertiary brand color (reserved for additional accents). */
  accentColor3?: string
  features: { icon: string; title: string; body: string }[]
  /** Sprint 14 — '3col' (default, md:grid-cols-3), '2col' (md:grid-cols-2),
   *  'list' (single-column with horizontal cards), '4col' (md:grid-cols-4). */
  layoutVariant?: '3col' | '2col' | 'list' | '4col'
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.8, 0.36, 1] as const } },
}

export function FeaturesStagger({
  eyebrow,
  headline,
  body,
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
  features,
  layoutVariant = '3col',
}: FeaturesStaggerProps) {
  // Sprint 14 — grid columns per variant
  const gridClass =
    layoutVariant === 'list' ? 'grid-cols-1' :
    layoutVariant === '2col' ? 'grid-cols-1 md:grid-cols-2' :
    layoutVariant === '4col' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                                'grid-cols-1 md:grid-cols-3'
  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 text-white">
      {/* subtle gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor2}, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          {eyebrow ? (
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{headline}</h2>
          {body ? <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">{body}</p> : null}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className={`grid gap-6 ${gridClass}`}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm"
            >
              {/* hover gradient border */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}33, transparent 60%)`,
                }}
              />
              <div
                className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})`,
                  boxShadow: `0 10px 30px -10px ${accentColor}`,
                }}
              >
                {f.icon}
              </div>
              <h3 className="relative mb-2 text-xl font-bold">{f.title}</h3>
              <p className="relative text-sm leading-relaxed text-white/60">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
