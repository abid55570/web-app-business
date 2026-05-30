export type MetricGridEntry = {
  label: string
  value: string
  unit?: string
  delta?: string
  deltaPositive?: boolean
}

export type MetricGridProps = {
  metrics: MetricGridEntry[]
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <section className="px-6 py-8 lg:px-12">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <li key={i}>
            <article className="rounded-lg border border-border bg-surface-raised p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {m.label}
              </p>
              <p className="mt-2 flex items-baseline gap-1 text-foreground">
                <span className="text-3xl font-bold">{m.value}</span>
                {m.unit ? (
                  <span className="text-sm text-muted-foreground">{m.unit}</span>
                ) : null}
              </p>
              {m.delta ? (
                <p
                  className={`mt-1 text-xs font-medium ${
                    m.deltaPositive !== false
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {m.deltaPositive !== false ? '↑' : '↓'} {m.delta}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
