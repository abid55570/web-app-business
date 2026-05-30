export type ComparisonCardProps = {
  label: string
  aLabel: string
  aValue: string
  bLabel: string
  bValue: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

export function ComparisonCard({
  label,
  aLabel,
  aValue,
  bLabel,
  bValue,
  delta,
  trend = 'flat',
}: ComparisonCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-muted-foreground'
  return (
    <article className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-4 grid grid-cols-2 divide-x divide-border">
        <div className="pr-4">
          <p className="text-xs text-muted-foreground">{aLabel}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{aValue}</p>
        </div>
        <div className="pl-4">
          <p className="text-xs text-muted-foreground">{bLabel}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{bValue}</p>
        </div>
      </div>
      {delta ? (
        <p className={`mt-3 text-xs font-semibold ${trendColor}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '◆'} {delta}
        </p>
      ) : null}
    </article>
  )
}
