export type ChartLineSparkProps = {
  heading?: string
  label?: string
  values: number[]
  unit?: string
  trend?: 'up' | 'down' | 'flat'
}

export function ChartLineSpark({
  heading,
  label,
  values,
  unit = '',
  trend = 'up',
}: ChartLineSparkProps) {
  const w = 320
  const h = 80
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')
  const trendColor =
    trend === 'up'
      ? 'text-success-fg'
      : trend === 'down'
      ? 'text-error-fg'
      : 'text-muted-foreground'
  const trendChar = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-raised p-6">
        {heading ? (
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {heading}
          </h3>
        ) : null}
        <p className="mt-1 text-3xl font-bold text-foreground">
          {values[values.length - 1]}
          {unit}
          <span className={`ml-2 text-sm ${trendColor}`}>{trendChar}</span>
        </p>
        {label ? (
          <p className="mb-3 text-xs text-muted-foreground">{label}</p>
        ) : null}
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-20 w-full"
          preserveAspectRatio="none"
        >
          <polyline
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
        </svg>
      </div>
    </section>
  )
}
