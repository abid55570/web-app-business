export type DonutSlice = {
  label: string
  value: number
  color: string
}

export type DonutChartProps = {
  heading?: string
  slices: DonutSlice[]
}

export function DonutChart({ heading, slices }: DonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null
  let acc = 0
  const stops = slices
    .map((s) => {
      const start = (acc / total) * 360
      acc += s.value
      const end = (acc / total) * 360
      return `${s.color} ${start}deg ${end}deg`
    })
    .join(', ')
  return (
    <section className="px-6 py-10 lg:px-12">
      {heading ? (
        <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 lg:flex-row">
        <div
          role="img"
          aria-label={`${slices.length}-slice donut chart, total ${total}`}
          className="relative h-48 w-48 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="absolute inset-6 rounded-full bg-background" />
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {slices.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className="h-3 w-3 rounded"
                  style={{ background: s.color }}
                  aria-hidden="true"
                />
                {s.label}
              </span>
              <span className="text-muted-foreground">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
