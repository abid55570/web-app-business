export type StatsThreeColumnStat = {
  value: string
  label: string
  delta?: string
  up?: boolean
}

export type StatsThreeColumnProps = {
  stats: StatsThreeColumnStat[]
}

export function StatsThreeColumn({ stats }: StatsThreeColumnProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-5xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-raised sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s, i) => (
          <div key={i} className="p-6 text-center">
            <p className="text-4xl font-black text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            {s.delta ? (
              <p
                className={`mt-2 text-xs font-semibold ${
                  s.up ? 'text-success-fg' : 'text-error-fg'
                }`}
              >
                {s.up ? '▲' : '▼'} {s.delta}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
