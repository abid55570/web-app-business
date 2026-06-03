'use client'
import { motion } from 'framer-motion'

export type TestimonialsMarqueePremiumProps = {
  eyebrow?: string
  headline: string
  accentColor?: string
  quotes: { body: string; authorName: string; authorRole?: string; company?: string }[]
}

export function TestimonialsMarqueePremium({
  eyebrow,
  headline,
  accentColor = '#6366f1',
  quotes,
}: TestimonialsMarqueePremiumProps) {
  const half = Math.ceil(quotes.length / 2)
  const rA = quotes.slice(0, half).length ? quotes.slice(0, half) : quotes
  const rB = quotes.slice(half).length ? quotes.slice(half) : quotes

  return (
    <section className="relative overflow-hidden bg-black py-32 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-14 px-6 text-center"
      >
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-4xl font-bold leading-tight md:text-5xl">{headline}</h2>
      </motion.div>

      <MarqueeRow quotes={rA} direction="left" accentColor={accentColor} />
      <div className="mt-6">
        <MarqueeRow quotes={rB} direction="right" accentColor={accentColor} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />
    </section>
  )
}

function MarqueeRow({
  quotes,
  direction,
  accentColor,
}: {
  quotes: { body: string; authorName: string; authorRole?: string; company?: string }[]
  direction: 'left' | 'right'
  accentColor: string
}) {
  const doubled = [...quotes, ...quotes]
  return (
    <div className="group relative flex overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-6 px-3"
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((q, i) => (
          <Card key={i} q={q} accentColor={accentColor} />
        ))}
      </motion.div>
    </div>
  )
}

function Card({
  q,
  accentColor,
}: {
  q: { body: string; authorName: string; authorRole?: string; company?: string }
  accentColor: string
}) {
  return (
    <div className="w-[360px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
      <p className="mb-5 text-sm leading-relaxed text-white/85">&ldquo;{q.body}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}
        >
          {q.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold">{q.authorName}</p>
          <p className="text-xs text-white/50">
            {q.authorRole}
            {q.company ? ` · ${q.company}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
