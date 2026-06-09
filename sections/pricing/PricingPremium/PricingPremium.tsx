'use client'
import { motion } from 'framer-motion'

export type PricingPremiumProps = {
  eyebrow?: string
  headline: string
  body?: string
  accentColor?: string
  /** Secondary brand color (highlight tier badge and CTA gradient end). */
  accentColor2?: string
  /** Tertiary brand color (reserved for additional accents). */
  accentColor3?: string
  tiers: {
    name: string
    price: string
    cadence?: string
    tagline?: string
    features: string[]
    ctaLabel: string
    ctaHref: string
    highlight?: boolean
  }[]
}

export function PricingPremium({
  eyebrow,
  headline,
  body,
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
  tiers,
}: PricingPremiumProps) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto mb-16 max-w-3xl text-center"
      >
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-4xl font-bold leading-tight md:text-5xl">{headline}</h2>
        {body ? <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">{body}</p> : null}
      </motion.div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={
              'relative rounded-3xl p-8 ' +
              (t.highlight
                ? 'border border-transparent bg-gradient-to-b from-white/[0.08] to-white/[0.02]'
                : 'border border-white/10 bg-white/[0.03]')
            }
            style={
              t.highlight
                ? {
                    boxShadow: `0 0 0 1px ${accentColor}55, 0 30px 80px -20px ${accentColor}55`,
                  }
                : undefined
            }
          >
            {t.highlight ? (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}
              >
                Most popular
              </span>
            ) : null}
            <h3 className="text-lg font-bold">{t.name}</h3>
            {t.tagline ? <p className="mb-6 text-sm text-white/50">{t.tagline}</p> : <div className="mb-6" />}
            <div className="mb-6 flex items-baseline gap-1">
              <span
                className="text-5xl font-extrabold tracking-tight"
                style={t.highlight ? { background: `linear-gradient(135deg, #fff, ${accentColor})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : undefined}
              >
                {t.price}
              </span>
              {t.cadence ? <span className="text-sm text-white/50">{t.cadence}</span> : null}
            </div>
            <ul className="mb-8 space-y-3 text-sm">
              {t.features.map((f, k) => (
                <li key={k} className="flex items-start gap-3 text-white/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: accentColor + '22', color: accentColor }}>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={t.ctaHref}
              className={
                'block w-full rounded-xl px-5 py-3 text-center text-sm font-semibold transition hover:scale-[1.02] ' +
                (t.highlight ? 'text-white shadow-xl' : 'border border-white/20 text-white/90 hover:border-white/40')
              }
              style={t.highlight ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` } : undefined}
            >
              {t.ctaLabel}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
