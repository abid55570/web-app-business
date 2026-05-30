export type FeatureStickyScrollItem = {
  title: string
  description: string
  imageUrl?: string
}

export type FeatureStickyScrollProps = {
  heading?: string
  items: FeatureStickyScrollItem[]
}

export function FeatureStickyScroll({
  heading,
  items,
}: FeatureStickyScrollProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-12 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div className="space-y-32">
          {items.map((it, i) => (
            <article key={i}>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mb-3 text-2xl font-semibold text-foreground">
                {it.title}
              </h3>
              <p className="text-base text-muted-foreground">
                {it.description}
              </p>
            </article>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            {items[0]?.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={items[0].imageUrl}
                alt=""
                className="w-full rounded-2xl border border-border"
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
