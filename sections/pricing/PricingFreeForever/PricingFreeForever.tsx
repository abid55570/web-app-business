export type PricingFreeForeverProps = {
  heading?: string
  body?: string
  perks: string[]
  ctaLabel: string
  ctaHref?: string
  legal?: string
}

export function PricingFreeForever({
  heading = 'Free, forever',
  body = 'No credit card required. No trial. No expiry.',
  perks,
  ctaLabel,
  ctaHref = '#',
  legal,
}: PricingFreeForeverProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border-2 border-primary bg-surface-raised p-8 text-center shadow-xl">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          Free plan
        </p>
        <h2 className="mb-3 text-3xl font-bold text-foreground">{heading}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{body}</p>
        <p className="mb-6 text-6xl font-black text-foreground">
          $0
          <span className="text-lg font-normal text-muted-foreground">
            /mo
          </span>
        </p>
        <ul className="mb-6 space-y-2 text-left text-sm text-foreground">
          {perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <a
          href={ctaHref}
          className="block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          {ctaLabel}
        </a>
        {legal ? (
          <p className="mt-3 text-xs text-muted-foreground">{legal}</p>
        ) : null}
      </div>
    </section>
  )
}
