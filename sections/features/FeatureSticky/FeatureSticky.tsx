export type FeatureStickyItem = {
  title: string
  body: string
}

export type FeatureStickyProps = {
  pinnedImageUrl: string
  pinnedAlt?: string
  items: FeatureStickyItem[]
}

export function FeatureSticky({
  pinnedImageUrl,
  pinnedAlt = '',
  items,
}: FeatureStickyProps) {
  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-2">
      <div className="lg:sticky lg:top-24 lg:self-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pinnedImageUrl}
          alt={pinnedAlt}
          className="w-full rounded-2xl object-cover shadow-lg"
        />
      </div>
      <div className="space-y-12">
        {items.map((it, i) => (
          <article key={i}>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Step {i + 1}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {it.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
