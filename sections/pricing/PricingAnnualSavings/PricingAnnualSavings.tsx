export type PricingAnnualSavingsProps = {
  planName: string
  monthlyPrice: string
  annualPrice: string
  saveLabel: string
  perks: string[]
  ctaLabel?: string
  ctaHref?: string
}
export function PricingAnnualSavings({ planName, monthlyPrice, annualPrice, saveLabel, perks, ctaLabel = 'Save with annual', ctaHref = '#' }: PricingAnnualSavingsProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border-2 border-primary bg-surface-raised p-8 shadow-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{planName}</p>
        <p className="mb-2 text-5xl font-black text-foreground">
          {annualPrice}<span className="text-base font-normal text-muted-foreground"> /yr</span>
        </p>
        <p className="mb-4 text-sm text-muted-foreground">vs <s>{monthlyPrice}/yr</s> billed monthly</p>
        <p className="mb-6 inline-block rounded-full bg-success-bg px-3 py-1 text-xs font-bold uppercase text-success-fg">{saveLabel}</p>
        <ul className="mb-6 space-y-2 text-sm text-foreground">
          {perks.map((p, i) => <li key={i}>✓ {p}</li>)}
        </ul>
        <a href={ctaHref} className="block rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground">{ctaLabel}</a>
      </div>
    </section>
  )
}
