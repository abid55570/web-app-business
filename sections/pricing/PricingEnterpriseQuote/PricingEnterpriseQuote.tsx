export type PricingEnterpriseQuoteProps = {
  heading: string
  subheading?: string
  perks: string[]
  contactLabel?: string
  contactHref?: string
  legal?: string
}

export function PricingEnterpriseQuote({
  heading,
  subheading,
  perks,
  contactLabel = 'Request a quote',
  contactHref = '#',
  legal,
}: PricingEnterpriseQuoteProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 rounded-3xl border border-border bg-gradient-to-br from-surface-raised to-surface-overlay p-10 lg:grid-cols-2 lg:p-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Enterprise
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
            {heading}
          </h2>
          {subheading ? (
            <p className="mb-6 text-base text-muted-foreground">
              {subheading}
            </p>
          ) : null}
          <a
            href={contactHref}
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {contactLabel}
          </a>
          {legal ? (
            <p className="mt-3 text-xs text-muted-foreground">{legal}</p>
          ) : null}
        </div>
        <ul className="space-y-3 border-l border-border pl-8 text-sm text-foreground">
          {perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
