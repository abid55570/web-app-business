export type StatsTickerTapeItem = {
  symbol: string
  value: string
  delta?: string
  up?: boolean
}

export type StatsTickerTapeProps = {
  items: StatsTickerTapeItem[]
}

export function StatsTickerTape({ items }: StatsTickerTapeProps) {
  const doubled = [...items, ...items]
  return (
    <section className="overflow-hidden border-y border-border bg-surface-raised py-3">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: 'stats-ticker 40s linear infinite' }}
      >
        {doubled.map((it, i) => (
          <span
            key={i}
            className="flex items-baseline gap-2 font-mono text-sm text-foreground"
          >
            <strong className="text-muted-foreground">{it.symbol}</strong>
            <span>{it.value}</span>
            {it.delta ? (
              <span
                className={it.up ? 'text-success-fg' : 'text-error-fg'}
              >
                {it.up ? '▲' : '▼'} {it.delta}
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <style>{`@keyframes stats-ticker {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }`}</style>
    </section>
  )
}
