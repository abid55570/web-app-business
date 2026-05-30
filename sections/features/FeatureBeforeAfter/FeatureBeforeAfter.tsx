export type FeatureBeforeAfterProps = {
  heading?: string
  beforeLabel?: string
  afterLabel?: string
  beforeItems: string[]
  afterItems: string[]
}

export function FeatureBeforeAfter({
  heading,
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeItems,
  afterItems,
}: FeatureBeforeAfterProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-overlay p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {beforeLabel}
          </p>
          <ul className="space-y-2">
            {beforeItems.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground line-through"
              >
                <span aria-hidden>✕</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            {afterLabel}
          </p>
          <ul className="space-y-2">
            {afterItems.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm font-medium text-foreground"
              >
                <span aria-hidden className="text-primary">
                  ✓
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
