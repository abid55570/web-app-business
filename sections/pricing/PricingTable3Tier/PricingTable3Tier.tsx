/**
 * PricingTable3Tier — three columns of pricing cards. `highlight: true`
 * on a tier visually promotes it (border + scale). Stacks vertically on
 * `<lg`; columns equalize via grid auto-rows.
 */
export type PricingTier = {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  ctaLabel?: string
  ctaHref?: string
  highlight?: boolean
}

export type PricingTable3TierProps = {
  eyebrow?: string
  headline?: string
  tiers: PricingTier[]
}

export function PricingTable3Tier({
  eyebrow,
  headline,
  tiers,
}: PricingTable3TierProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        {headline ? (
          <h2 className="text-3xl font-bold text-foreground">{headline}</h2>
        ) : null}
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={
              t.highlight
                ? 'flex flex-col rounded-lg border-2 border-primary bg-card p-8 shadow-lg lg:scale-105'
                : 'flex flex-col rounded-lg border border-border bg-card p-8'
            }
          >
            <h3 className="text-xl font-semibold text-foreground">{t.name}</h3>
            {t.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            ) : null}
            <p className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-foreground">
                {t.price}
              </span>
              {t.period ? (
                <span className="ml-1 text-sm text-muted-foreground">
                  / {t.period}
                </span>
              ) : null}
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-foreground">
              {t.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <a
              href={t.ctaHref ?? '#'}
              className={
                t.highlight
                  ? 'mt-6 inline-flex justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90'
                  : 'mt-6 inline-flex justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent'
              }
            >
              {t.ctaLabel ?? 'Choose plan'}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
