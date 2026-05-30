export type PricingCalculatorProps = {
  heading: string
  metric: string
  unitLabel: string
  unitPrice: number
  currency?: string
  min?: number
  max?: number
  defaultUnits: number
  ctaLabel: string
  ctaHref: string
}

export function PricingCalculator({
  heading,
  metric,
  unitLabel,
  unitPrice,
  currency = '$',
  min = 0,
  max = 1000,
  defaultUnits,
  ctaLabel,
  ctaHref,
}: PricingCalculatorProps) {
  const monthly = (defaultUnits * unitPrice).toFixed(2)
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-raised p-8">
        <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay only for what you use — {currency}
          {unitPrice} per {unitLabel}.
        </p>
        <div className="mt-6">
          <label htmlFor="b-dash-units" className="block text-sm font-medium text-foreground">
            {metric}
          </label>
          <input
            id="b-dash-units"
            type="range"
            min={min}
            max={max}
            defaultValue={defaultUnits}
            className="mt-2 w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span className="font-semibold text-foreground">
              {defaultUnits} {unitLabel}
            </span>
            <span>{max}</span>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-surface-sunken p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Estimated / month
          </p>
          <p className="mt-1 text-4xl font-bold text-foreground">
            {currency}
            {monthly}
          </p>
        </div>
        <a
          href={ctaHref}
          className="mt-6 block rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  )
}
