'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export type HeroEventCountdownProps = {
  eyebrow?: string
  headline: string
  date: string
  city?: string
  ctaLabel?: string
  ctaHref?: string
  accentColor?: string
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number; isPast: boolean }

function diff(targetMs: number, nowMs: number): Remaining {
  const ms = Math.max(0, targetMs - nowMs)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const seconds = Math.floor((ms / 1000) % 60)
  return { days, hours, minutes, seconds, isPast: targetMs <= nowMs }
}

export function HeroEventCountdown({
  eyebrow,
  headline,
  date,
  city,
  ctaLabel = 'RSVP',
  ctaHref = '/signup',
  accentColor = '#6366f1',
}: HeroEventCountdownProps) {
  const target = new Date(date).getTime()
  const [now, setNow] = useState(target - 1000 * 60 * 60 * 24 * 30) // SSR-safe placeholder
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const r = diff(target, now)
  const niceDate = new Date(target).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        {eyebrow ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: accentColor }}
          >
            {eyebrow}
          </motion.p>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.8, 0.36, 1] }}
          className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${accentColor} 50%, #ec4899 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 text-lg text-white/70 md:text-xl"
        >
          {niceDate}
          {city ? <span className="ml-2 text-white/50">· {city}</span> : null}
        </motion.p>

        {/* Countdown grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-12 grid grid-cols-4 gap-3 md:gap-6"
        >
          {[
            { label: 'days', value: r.days },
            { label: 'hours', value: r.hours },
            { label: 'mins', value: r.minutes },
            { label: 'secs', value: r.seconds },
          ].map((u) => (
            <div
              key={u.label}
              className="min-w-[72px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 backdrop-blur-sm md:min-w-[110px]"
              style={{ boxShadow: `0 4px 24px ${accentColor}1a` }}
            >
              <div className="font-mono text-3xl font-bold tabular-nums md:text-5xl" style={{ color: accentColor }}>
                {String(u.value).padStart(2, '0')}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{u.label}</div>
            </div>
          ))}
        </motion.div>

        {r.isPast ? (
          <p className="text-sm text-white/50">This event has started — join the live page.</p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <a
            href={ctaHref}
            className="inline-flex items-center gap-3 rounded-full px-10 py-4 text-base font-semibold text-white shadow-2xl transition-transform hover:scale-[1.05]"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}
          >
            {ctaLabel}
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
