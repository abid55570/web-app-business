export type FeaturePillar = {
  icon?: string
  title: string
  body: string
}

export type FeaturePillarsProps = {
  heading?: string
  intro?: string
  pillars: FeaturePillar[]
}

export function FeaturePillars({ heading, intro, pillars }: FeaturePillarsProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        {heading ? (
          <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
        ) : null}
        {intro ? (
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            {intro}
          </p>
        ) : null}
      </div>
      <ul className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <li key={i} className="text-center">
            <span
              aria-hidden
              className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary"
            >
              {p.icon ?? '✦'}
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {p.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
