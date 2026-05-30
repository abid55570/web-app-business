export type SparkBarsItem = {
  label: string
  values: number[]
  current: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

export type SparkBarsProps = {
  items: SparkBarsItem[]
}

const TREND: Record<NonNullable<SparkBarsItem['trend']>, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  flat: 'text-muted-foreground',
}

export function SparkBars({ items }: SparkBarsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => {
        const max = Math.max(...it.values, 1)
        return (
          <li
            key={i}
            className="rounded-xl border border-border bg-surface-raised p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {it.label}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-foreground">
                {it.current}
              </p>
              {it.delta ? (
                <p className={`text-xs font-semibold ${TREND[it.trend ?? 'flat']}`}>
                  {it.delta}
                </p>
              ) : null}
            </div>
            <div className="mt-3 flex h-10 items-end gap-0.5">
              {it.values.map((v, j) => (
                <span
                  key={j}
                  className="flex-1 rounded-sm bg-primary/70"
                  style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                />
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
