export type RatingsSummaryProps = {
  averageRating: number
  totalReviews: number
  breakdown: Array<{ stars: 1 | 2 | 3 | 4 | 5; count: number }>
}

export function RatingsSummary({
  averageRating,
  totalReviews,
  breakdown,
}: RatingsSummaryProps) {
  const max = Math.max(...breakdown.map((b) => b.count), 1)
  return (
    <section className="mx-auto grid max-w-3xl gap-8 rounded-2xl border border-border bg-surface-raised p-6 sm:grid-cols-[auto_1fr]">
      <div className="text-center">
        <p className="text-5xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </p>
        <p className="mt-1 text-amber-500">
          {'★'.repeat(Math.round(averageRating))}
          <span className="text-muted-foreground/40">
            {'☆'.repeat(5 - Math.round(averageRating))}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalReviews.toLocaleString()} reviews
        </p>
      </div>
      <ul className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((s) => {
          const row = breakdown.find((b) => b.stars === s)
          const c = row?.count ?? 0
          const pct = Math.round((c / max) * 100)
          return (
            <li key={s} className="flex items-center gap-3 text-xs">
              <span className="w-6 text-right text-muted-foreground">
                {s}★
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <span
                  className="block h-full rounded-full bg-amber-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-muted-foreground">
                {c}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
