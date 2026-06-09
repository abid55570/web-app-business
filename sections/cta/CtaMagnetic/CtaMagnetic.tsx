'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export type CtaMagneticProps = {
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
  accentColor?: string
  /** Secondary brand color (second blob, headline gradient end, button gradient end). */
  accentColor2?: string
  /** Tertiary brand color (third blob). */
  accentColor3?: string
}

export function CtaMagnetic({
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '#',
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
}: CtaMagneticProps) {
  return (
    <section
      className="relative overflow-hidden bg-black px-6 py-40 text-center text-white"
      style={{ isolation: 'isolate' }}
    >
      {/* Animated gradient blobs */}
      <FloatingBlob color={accentColor} className="left-[10%] top-[20%] h-80 w-80" delay={0} />
      <FloatingBlob color={accentColor2} className="right-[12%] top-[40%] h-72 w-72" delay={3} />
      <FloatingBlob color={accentColor3} className="bottom-[8%] left-[35%] h-64 w-64" delay={6} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl"
      >
        <h2
          className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${accentColor} 50%, ${accentColor2} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {headline}
        </h2>
        {body ? <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">{body}</p> : null}
        <div className="mt-12">
          <MagneticButton href={ctaHref} accentColor={accentColor} accentColor2={accentColor2}>
            {ctaLabel}
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  )
}

function MagneticButton({
  children,
  href,
  accentColor,
  accentColor2,
}: {
  children: React.ReactNode
  href: string
  accentColor: string
  accentColor2: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.5 })

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * 0.35)
    y.set(dy * 0.35)
  }
  function reset() {
    x.set(0); y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className="inline-flex items-center gap-3 rounded-full px-10 py-5 text-base font-semibold text-white shadow-2xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}
      />
      <span className="relative z-10">{children}</span>
      <span className="relative z-10">→</span>
    </motion.a>
  )
}

function FloatingBlob({
  color,
  className,
  delay,
}: {
  color: string
  className: string
  delay: number
}) {
  // Static deterministic floating animation via CSS keyframes via inline style + motion.
  const opacity = useTransform(useMotionValue(0), [0, 1], [0.3, 0.5])
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: color, opacity }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
      }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}
