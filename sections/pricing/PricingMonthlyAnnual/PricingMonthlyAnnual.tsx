export type PricingMonthlyAnnualTier = {
  name: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  ctaLabel?: string
  ctaHref?: string
  highlighted?: boolean
}

export type PricingMonthlyAnnualProps = {
  heading?: string
  currency?: string
  tiers: PricingMonthlyAnnualTier[]
}

export function PricingMonthlyAnnual({
  heading,
  currency = '$',
  tiers,
}: PricingMonthlyAnnualProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-4 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface-raised p-1 text-sm">
          <input
            type="radio"
            id="pmt-monthly"
            name="pmt-billing"
            className="peer/m hidden"
            defaultChecked
          />
          <label
            htmlFor="pmt-monthly"
            className="cursor-pointer rounded-full px-4 py-1.5 peer-checked/m:bg-primary peer-checked/m:text-primary-foreground"
          >
            Monthly
          </label>
          <input
            type="radio"
            id="pmt-annual"
            name="pmt-billing"
            className="peer/a hidden"
          />
          <label
            htmlFor="pmt-annual"
            className="cursor-pointer rounded-full px-4 py-1.5 peer-checked/a:bg-primary peer-checked/a:text-primary-foreground"
          >
            Annual <span className="text-xs opacity-70">−20%</span>
          </label>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-6 ${
              t.highlighted
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border bg-surface-raised'
            }`}
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {t.name}
            </h3>
            <p className="mb-4 text-3xl font-bold text-foreground">
              {currency}
              {t.monthlyPrice}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /mo · or {currency}
                {t.annualPrice}/yr
              </span>
            </p>
            <ul className="mb-6 space-y-2 text-sm text-foreground">
              {t.features.map((f, j) => (
                <li key={j}>✓ {f}</li>
              ))}
            </ul>
            {t.ctaLabel ? (
              <a
                href={t.ctaHref ?? '#'}
                className={`block rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                  t.highlighted
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-surface-overlay'
                }`}
              >
                {t.ctaLabel}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
