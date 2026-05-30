export type PricingCompareCol = {
  name: string
  tagline: string
  price: string
  cadence?: string
  ctaLabel: string
  ctaHref: string
  bullets: string[]
  highlight?: boolean
}

export type PricingCompareProps = {
  heading?: string
  columns: PricingCompareCol[]
}

export function PricingCompare({ heading, columns }: PricingCompareProps) {
  return (
    <section className="px-6 py-20">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-0 overflow-hidden rounded-2xl border border-border lg:grid-cols-3">
        {columns.map((c, i) => (
          <li
            key={i}
            className={`flex flex-col p-8 ${
              c.highlight
                ? 'bg-primary text-primary-foreground'
                : 'border-l border-border bg-surface-raised first:border-l-0'
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-widest ${
              c.highlight ? 'opacity-80' : 'text-muted-foreground'
            }`}>
              {c.name}
            </p>
            <p className={`mt-1 text-sm ${
              c.highlight ? 'opacity-90' : 'text-muted-foreground'
            }`}>
              {c.tagline}
            </p>
            <p className={`mt-4 text-4xl font-bold ${
              c.highlight ? '' : 'text-foreground'
            }`}>
              {c.price}
              {c.cadence ? (
                <span className={`ml-1 text-sm font-normal ${
                  c.highlight ? 'opacity-80' : 'text-muted-foreground'
                }`}>
                  /{c.cadence}
                </span>
              ) : null}
            </p>
            <ul className={`mt-6 flex-1 space-y-2 text-sm ${
              c.highlight ? 'opacity-95' : 'text-muted-foreground'
            }`}>
              {c.bullets.map((b, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <a
              href={c.ctaHref}
              className={`mt-6 rounded-md px-5 py-2.5 text-center text-sm font-semibold ${
                c.highlight
                  ? 'bg-surface-raised text-foreground hover:opacity-90'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {c.ctaLabel}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
