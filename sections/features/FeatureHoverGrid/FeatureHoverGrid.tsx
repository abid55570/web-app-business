export type FeatureHoverGridItem = {
  icon: string
  title: string
  description: string
}

export type FeatureHoverGridProps = {
  heading?: string
  items: FeatureHoverGridItem[]
}

export function FeatureHoverGrid({
  heading,
  items,
}: FeatureHoverGridProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <article
            key={i}
            className="group relative bg-surface-raised p-6 transition-colors hover:bg-primary"
          >
            <div className="mb-3 text-3xl">{it.icon}</div>
            <h3 className="mb-1 text-base font-semibold text-foreground group-hover:text-primary-foreground">
              {it.title}
            </h3>
            <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/85">
              {it.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
