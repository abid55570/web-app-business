export type PricingSimpleTier = {
  name: string
  price: string
  cadence?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  badge?: string
}

export type PricingSimpleProps = {
  heading: string
  tiers: PricingSimpleTier[]
}

export function PricingSimple({ heading, tiers }: PricingSimpleProps) {
  return (
    <section className="px-6 py-20">
      <h2 className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold text-foreground">
        {heading}
      </h2>
      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        {tiers.map((t, i) => (
          <li
            key={i}
            className="relative rounded-2xl border border-border bg-surface-raised p-7"
          >
            {t.badge ? (
              <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {t.badge}
              </span>
            ) : null}
            <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
            <p className="mt-3 text-4xl font-bold text-foreground">
              {t.price}
              {t.cadence ? (
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  /{t.cadence}
                </span>
              ) : null}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {t.features.map((f, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden className="text-primary">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={t.ctaHref}
              className="mt-6 block rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {t.ctaLabel}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
