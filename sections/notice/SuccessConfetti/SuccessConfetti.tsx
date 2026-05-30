export type SuccessConfettiProps = {
  title: string
  body?: string
  primaryLabel?: string
  primaryHref?: string
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7']

export function SuccessConfetti({
  title,
  body,
  primaryLabel,
  primaryHref,
}: SuccessConfettiProps) {
  return (
    <section className="relative grid place-items-center overflow-hidden px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 30 }).map((_, i) => {
          const left = (i * 173 + 31) % 100
          const delay = (i % 6) * 0.15
          const color = COLORS[i % COLORS.length]
          return (
            <span
              key={i}
              className="absolute h-2 w-2 animate-confetti-burst"
              style={{
                left: `${left}%`,
                top: '20%',
                backgroundColor: color,
                animationDelay: `${delay}s`,
              }}
            />
          )
        })}
      </div>
      <div className="relative">
        <span
          aria-hidden
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600"
        >
          ✓
        </span>
        <h2 className="mt-5 text-3xl font-bold text-foreground">{title}</h2>
        {body ? (
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            {body}
          </p>
        ) : null}
        {primaryLabel && primaryHref ? (
          <a
            href={primaryHref}
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {primaryLabel} →
          </a>
        ) : null}
      </div>
    </section>
  )
}
