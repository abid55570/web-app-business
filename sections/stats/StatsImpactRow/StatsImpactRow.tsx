export type StatsImpactRowStat = {
  value: string
  label: string
  caption?: string
}

export type StatsImpactRowProps = {
  eyebrow?: string
  heading?: string
  stats: StatsImpactRowStat[]
}

export function StatsImpactRow({
  eyebrow,
  heading,
  stats,
}: StatsImpactRowProps) {
  return (
    <section className="border-y border-border bg-surface-raised px-6 py-16">
      <div className="mx-auto max-w-6xl text-center">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        {heading ? (
          <h2 className="mx-auto mb-10 max-w-2xl text-2xl font-semibold text-foreground sm:text-3xl">
            {heading}
          </h2>
        ) : null}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-primary sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {s.label}
              </p>
              {s.caption ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
