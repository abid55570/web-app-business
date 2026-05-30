export type HeroGridCard = {
  title: string
  body: string
  icon?: string
}

export type HeroGridProps = {
  headline: string
  intro: string
  ctaLabel: string
  ctaHref: string
  cards: HeroGridCard[]
}

export function HeroGrid({
  headline,
  intro,
  ctaLabel,
  ctaHref,
  cards,
}: HeroGridProps) {
  return (
    <section className="px-6 pt-24 pb-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {intro}
        </p>
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
      <ul className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-surface-raised p-6"
          >
            <span aria-hidden className="text-2xl text-primary">
              {c.icon ?? '✦'}
            </span>
            <p className="mt-3 font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
