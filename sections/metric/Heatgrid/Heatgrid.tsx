export type HeatgridCell = {
  label: string
  value: number
}

export type HeatgridProps = {
  heading?: string
  rows: number
  cols: number
  cells: HeatgridCell[]
  unit?: string
}

const BUCKETS = [
  'bg-surface-sunken',
  'bg-primary/15',
  'bg-primary/30',
  'bg-primary/55',
  'bg-primary',
]

export function Heatgrid({
  heading,
  rows,
  cols,
  cells,
  unit,
}: HeatgridProps) {
  const max = Math.max(...cells.map((c) => c.value), 1)
  function bucket(v: number) {
    if (v === 0) return 0
    const r = v / max
    if (r > 0.8) return 4
    if (r > 0.55) return 3
    if (r > 0.3) return 2
    return 1
  }
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      {heading ? (
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {heading}
        </h3>
      ) : null}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 28px)`,
        }}
      >
        {cells.map((c, i) => (
          <span
            key={i}
            title={`${c.label}: ${c.value}${unit ?? ''}`}
            className={`rounded-sm ${BUCKETS[bucket(c.value)]}`}
          />
        ))}
      </div>
    </section>
  )
}
