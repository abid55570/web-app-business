export type KpiGridTile = {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

export type KpiGridProps = {
  tiles: KpiGridTile[]
}

const TREND_COLOR: Record<NonNullable<KpiGridTile['trend']>, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  flat: 'text-muted-foreground',
}

export function KpiGrid({ tiles }: KpiGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface-raised p-5"
        >
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.label}
          </dt>
          <dd className="mt-2 text-3xl font-bold text-foreground">{t.value}</dd>
          {t.delta ? (
            <p
              className={`mt-1 text-xs font-semibold ${
                TREND_COLOR[t.trend ?? 'flat']
              }`}
            >
              {t.trend === 'up' ? '▲' : t.trend === 'down' ? '▼' : '◆'} {t.delta}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  )
}
