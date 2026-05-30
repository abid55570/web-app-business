export type StatsBarChartItem = {
  label: string
  value: number
}

export type StatsBarChartProps = {
  heading?: string
  items: StatsBarChartItem[]
  unit?: string
}

export function StatsBarChart({
  heading,
  items,
  unit = '',
}: StatsBarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((it, i) => {
          const pct = (it.value / max) * 100
          return (
            <div key={i}>
              <div className="mb-1 flex justify-between text-sm text-foreground">
                <span>{it.label}</span>
                <span className="font-mono">
                  {it.value}
                  {unit}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
