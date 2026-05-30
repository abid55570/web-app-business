/**
 * PricingTableToggle — 3-tier pricing with monthly/yearly switch.
 * Switch uses a native radio + :checked sibling combinator so this stays
 * zero-JS. Renders both price labels; CSS hides the inactive one.
 */
export type PricingTier = {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
}

export type PricingTableToggleProps = {
  heading?: string
  monthlyLabel?: string
  yearlyLabel?: string
  tiers: PricingTier[]
}

export function PricingTableToggle({
  heading = 'Pricing',
  monthlyLabel = 'Monthly',
  yearlyLabel = 'Yearly (2 months free)',
  tiers,
}: PricingTableToggleProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24" data-billing="monthly">
      <h2 className="mb-6 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <fieldset className="mb-12 flex justify-center">
        <legend className="sr-only">Billing period</legend>
        <div className="inline-flex rounded-full border border-border p-1">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="billing"
              value="monthly"
              defaultChecked
              className="peer sr-only"
            />
            <span className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground">
              {monthlyLabel}
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="billing"
              value="yearly"
              className="peer sr-only"
            />
            <span className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground">
              {yearlyLabel}
            </span>
          </label>
        </div>
      </fieldset>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <li
            key={i}
            className={`flex flex-col rounded-xl border p-8 ${
              t.highlight
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border'
            }`}
          >
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t.name}
            </p>
            <p className="mb-1">
              <span className="text-4xl font-bold text-foreground">
                {t.currency}
                {t.monthlyPrice}
              </span>
              <span className="text-sm text-muted-foreground"> /mo</span>
            </p>
            <p className="mb-6 text-xs text-muted-foreground">
              or {t.currency}
              {t.yearlyPrice} billed yearly
            </p>
            <ul className="mb-8 grow space-y-2">
              {t.features.map((f, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={t.ctaHref}
              className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold ${
                t.highlight
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'border border-border text-foreground hover:bg-accent'
              }`}
            >
              {t.ctaLabel}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
