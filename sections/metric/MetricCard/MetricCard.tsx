export type MetricCardProps = {
  label: string
  value: string
  unit?: string
  delta?: string
  deltaPositive?: boolean
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaPositive = true,
}: MetricCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1 text-foreground">
        <span className="text-3xl font-bold">{value}</span>
        {unit ? (
          <span className="text-sm text-muted-foreground">{unit}</span>
        ) : null}
      </p>
      {delta ? (
        <p
          className={`mt-1 text-xs font-medium ${
            deltaPositive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      ) : null}
    </article>
  )
}
