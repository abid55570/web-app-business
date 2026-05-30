export type FeatureRatingsListItem = {
  feature: string
  ourScore: number
  competitorScore: number
}

export type FeatureRatingsListProps = {
  heading?: string
  ourLabel?: string
  competitorLabel?: string
  items: FeatureRatingsListItem[]
}

export function FeatureRatingsList({
  heading,
  ourLabel = 'Us',
  competitorLabel = 'Them',
  items,
}: FeatureRatingsListProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center justify-end gap-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="w-16 text-right">{ourLabel}</span>
          <span className="w-16 text-right">{competitorLabel}</span>
        </div>
        <ul className="divide-y divide-border">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-6 py-3">
              <span className="flex-1 text-sm text-foreground">
                {it.feature}
              </span>
              <span className="w-16 text-right text-sm">
                <span className="text-warning-fg">
                  {'★'.repeat(it.ourScore)}
                </span>
                <span className="text-muted-foreground">
                  {'★'.repeat(5 - it.ourScore)}
                </span>
              </span>
              <span className="w-16 text-right text-sm opacity-60">
                <span className="text-muted-foreground">
                  {'★'.repeat(it.competitorScore)}
                </span>
                <span className="text-muted-foreground/50">
                  {'★'.repeat(5 - it.competitorScore)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
