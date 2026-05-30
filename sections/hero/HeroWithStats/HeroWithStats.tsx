export type HeroStat = {
  value: string
  label: string
}

export type HeroWithStatsProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  stats: HeroStat[]
}

export function HeroWithStats({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  stats,
}: HeroWithStatsProps) {
  return (
    <section className="px-6 py-24 lg:py-28">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
      <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-y-8 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <dt className="order-2 text-sm text-muted-foreground">{s.label}</dt>
            <dd className="order-1 text-3xl font-bold text-foreground lg:text-4xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
