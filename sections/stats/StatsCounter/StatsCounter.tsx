/**
 * StatsCounter — big-number metric grid. Static numbers (no count-up
 * animation) so it works in SSR + screen readers without JS.
 */
export type Stat = { value: string; label: string; sublabel?: string }

export type StatsCounterProps = {
  eyebrow?: string
  headline?: string
  stats: Stat[]
}

export function StatsCounter({ eyebrow, headline, stats }: StatsCounterProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        {headline ? (
          <h2 className="mb-10 text-3xl font-bold text-foreground">
            {headline}
          </h2>
        ) : null}
      </div>
      <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className="rounded-lg border border-border bg-card p-6 text-center"
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-4xl font-bold text-primary">{s.value}</dd>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {s.label}
            </p>
            {s.sublabel ? (
              <p className="mt-1 text-xs text-muted-foreground">{s.sublabel}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}
