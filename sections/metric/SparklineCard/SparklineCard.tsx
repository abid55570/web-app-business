export type SparklineCardProps = {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  /** 0–100 values, one per point. Rendered as inline SVG polyline. */
  series: number[]
}

export function SparklineCard({
  label,
  value,
  delta,
  trend = 'flat',
  series,
}: SparklineCardProps) {
  const width = 120
  const height = 36
  const max = Math.max(...series, 1)
  const step = series.length > 1 ? width / (series.length - 1) : width
  const points = series
    .map((v, i) => `${(i * step).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`)
    .join(' ')
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-muted-foreground'
  const strokeColor =
    trend === 'up'
      ? 'stroke-emerald-500'
      : trend === 'down'
        ? 'stroke-red-500'
        : 'stroke-primary'
  return (
    <article className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <svg
          aria-hidden
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <polyline
            points={points}
            fill="none"
            strokeWidth={2}
            className={strokeColor}
          />
        </svg>
      </div>
      {delta ? (
        <p className={`mt-1 text-xs font-semibold ${trendColor}`}>{delta}</p>
      ) : null}
    </article>
  )
}
