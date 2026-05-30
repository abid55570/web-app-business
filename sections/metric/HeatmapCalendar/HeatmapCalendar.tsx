export type HeatmapDay = {
  date: string
  count: number
}

export type HeatmapCalendarProps = {
  heading?: string
  days: HeatmapDay[]
  columns?: number
}

function bucket(count: number, max: number): number {
  if (count === 0) return 0
  const ratio = count / max
  if (ratio > 0.66) return 4
  if (ratio > 0.33) return 3
  if (ratio > 0.1) return 2
  return 1
}

const BUCKET_COLORS = [
  'bg-surface-sunken',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/70',
  'bg-primary',
]

export function HeatmapCalendar({
  heading,
  days,
  columns = 53,
}: HeatmapCalendarProps) {
  const max = Math.max(...days.map((d) => d.count), 1)
  const total = days.reduce((s, d) => s + d.count, 0)
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      {heading ? (
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{heading}</h2>
          <p className="text-xs text-muted-foreground">{total} in window</p>
        </header>
      ) : null}
      <div
        className="grid auto-rows-[14px] gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, 14px)` }}
      >
        {days.map((d, i) => (
          <span
            key={i}
            title={`${d.date}: ${d.count}`}
            className={`rounded-sm ${BUCKET_COLORS[bucket(d.count, max)]}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        Less
        {BUCKET_COLORS.map((c, i) => (
          <span key={i} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        More
      </div>
    </section>
  )
}
