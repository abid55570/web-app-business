export type ChartDonutLegendSlice = {
  label: string
  value: number
  color: string
}

export type ChartDonutLegendProps = {
  heading?: string
  slices: ChartDonutLegendSlice[]
}

export function ChartDonutLegend({
  heading,
  slices,
}: ChartDonutLegendProps) {
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1
  const radius = 70
  const circ = 2 * Math.PI * radius
  let offset = 0
  return (
    <section className="px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 rounded-2xl border border-border bg-surface-raised p-6 sm:flex-row">
        <svg viewBox="-100 -100 200 200" className="h-48 w-48 -rotate-90">
          <circle r={radius} fill="none" stroke="currentColor" strokeWidth="20" className="text-surface-overlay" />
          {slices.map((s, i) => {
            const pct = s.value / total
            const seg = pct * circ
            const el = (
              <circle
                key={i}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="20"
                strokeDasharray={`${seg} ${circ - seg}`}
                strokeDashoffset={-offset}
              />
            )
            offset += seg
            return el
          })}
        </svg>
        <ul className="flex-1 space-y-2">
          {heading ? (
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {heading}
            </h3>
          ) : null}
          {slices.map((s, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-foreground">{s.label}</span>
              <span className="font-mono text-muted-foreground">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
