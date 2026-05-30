export type RatingsHistogramProps = {
  average: number
  total: number
  buckets: { stars: number; count: number }[]
}

export function RatingsHistogram({
  average,
  total,
  buckets,
}: RatingsHistogramProps) {
  const max = Math.max(...buckets.map((b) => b.count), 1)
  const sorted = [...buckets].sort((a, b) => b.stars - a.stars)
  const stars = Math.round(average)
  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-3xl items-center gap-8 rounded-2xl border border-border bg-surface-raised p-6 sm:grid-cols-[160px_1fr]">
        <div className="text-center">
          <p className="text-5xl font-black text-foreground">
            {average.toFixed(1)}
          </p>
          <p className="text-lg text-warning-fg">
            {'★'.repeat(stars)}
            <span className="text-muted-foreground">
              {'★'.repeat(5 - stars)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{total} reviews</p>
        </div>
        <ul className="space-y-1.5">
          {sorted.map((b) => {
            const pct = (b.count / max) * 100
            return (
              <li key={b.stars} className="flex items-center gap-2">
                <span className="w-4 text-xs font-medium text-muted-foreground">
                  {b.stars}
                </span>
                <span className="text-xs text-warning-fg">★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                  <span
                    className="block h-full bg-warning-fg"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-10 text-right text-xs font-mono text-muted-foreground">
                  {b.count}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
