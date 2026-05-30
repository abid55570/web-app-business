export type TrendArrowProps = {
  label: string
  value: string
  deltaPercent: number
  comparison?: string
}

export function TrendArrow({
  label,
  value,
  deltaPercent,
  comparison,
}: TrendArrowProps) {
  const isUp = deltaPercent >= 0
  const color = isUp ? 'text-emerald-600' : 'text-red-600'
  return (
    <article className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className={`text-sm font-semibold ${color}`}>
          {isUp ? '▲' : '▼'} {Math.abs(deltaPercent)}%
        </span>
      </p>
      {comparison ? (
        <p className="mt-1 text-xs text-muted-foreground">{comparison}</p>
      ) : null}
    </article>
  )
}
