export type SimpleBar = {
  label: string
  value: number
}

export type SimpleBarsProps = {
  heading?: string
  bars: SimpleBar[]
  unit?: string
}

export function SimpleBars({ heading, bars, unit }: SimpleBarsProps) {
  const max = Math.max(...bars.map((b) => b.value), 1)
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      {heading ? (
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          {heading}
        </h3>
      ) : null}
      <ul className="space-y-3">
        {bars.map((b, i) => {
          const pct = Math.round((b.value / max) * 100)
          return (
            <li key={i}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-foreground">{b.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {b.value}
                  {unit ?? ''}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
