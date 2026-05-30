/**
 * FeaturesBento — bento layout: 1 large tile + 4 small tiles.
 * Index 0 spans 2 cols × 2 rows on lg; 1-4 fill the surrounding grid.
 */
export type BentoFeature = {
  title: string
  body: string
  icon?: string
}

export type FeaturesBentoProps = {
  heading?: string
  features: BentoFeature[]
}

export function FeaturesBento({
  heading = 'Built for scale',
  features,
}: FeaturesBentoProps) {
  const [hero, ...rest] = features
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {hero ? (
          <article className="rounded-xl border border-border bg-surface-raised p-8 lg:col-span-2 lg:row-span-2">
            {hero.icon ? (
              <p className="mb-4 text-3xl" aria-hidden="true">
                {hero.icon}
              </p>
            ) : null}
            <h3 className="mb-3 text-2xl font-bold text-foreground">
              {hero.title}
            </h3>
            <p className="text-base text-muted-foreground">{hero.body}</p>
          </article>
        ) : null}
        {rest.slice(0, 4).map((f, i) => (
          <article
            key={i}
            className="rounded-xl border border-border bg-surface-raised p-6"
          >
            {f.icon ? (
              <p className="mb-3 text-2xl" aria-hidden="true">
                {f.icon}
              </p>
            ) : null}
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
