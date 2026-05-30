export type CtaTwoColumnCard = {
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  icon?: string
}

export type CtaTwoColumnProps = {
  heading?: string
  cards: [CtaTwoColumnCard, CtaTwoColumnCard]
}

export function CtaTwoColumn({ heading, cards }: CtaTwoColumnProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <article
            key={i}
            className={`rounded-2xl p-7 ${
              i === 0
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface-raised'
            }`}
          >
            <span
              aria-hidden
              className={`text-2xl ${
                i === 0 ? 'opacity-90' : 'text-primary'
              }`}
            >
              {c.icon ?? '✦'}
            </span>
            <h3 className={`mt-3 text-xl font-bold ${
              i === 0 ? '' : 'text-foreground'
            }`}>
              {c.title}
            </h3>
            <p className={`mt-2 text-sm ${
              i === 0 ? 'opacity-90' : 'text-muted-foreground'
            }`}>
              {c.body}
            </p>
            <a
              href={c.ctaHref}
              className={`mt-5 inline-flex items-center text-sm font-semibold ${
                i === 0
                  ? 'underline opacity-90 hover:opacity-100'
                  : 'text-primary hover:underline'
              }`}
            >
              {c.ctaLabel} →
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
