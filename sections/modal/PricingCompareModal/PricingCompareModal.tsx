export type PricingCompareModalTier = {
  name: string
  price: string
  perks: string[]
}

export type PricingCompareModalProps = {
  id?: string
  triggerLabel?: string
  heading?: string
  tiers: PricingCompareModalTier[]
}

export function PricingCompareModal({
  id = 'pricing-compare-modal',
  triggerLabel = 'Compare plans',
  heading = 'Compare plans',
  tiers,
}: PricingCompareModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-block rounded-lg border border-border bg-surface-raised px-5 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay"
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 overflow-y-auto bg-black/50 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="mx-auto my-12 w-full max-w-4xl rounded-2xl bg-surface-raised p-8 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">{heading}</h3>
            <a
              href="#"
              className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-surface-overlay"
            >
              Close
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-border p-4"
              >
                <h4 className="mb-1 text-sm font-bold text-foreground">
                  {t.name}
                </h4>
                <p className="mb-3 text-2xl font-black text-primary">
                  {t.price}
                </p>
                <ul className="space-y-1 text-xs text-foreground">
                  {t.perks.map((p, j) => (
                    <li key={j}>✓ {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
