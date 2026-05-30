export type PricingEnterpriseProps = {
  headline: string
  body?: string
  bullets: string[]
  contactLabel?: string
  contactHref: string
  callLabel?: string
  callHref?: string
}

export function PricingEnterprise({
  headline,
  body,
  bullets,
  contactLabel = 'Contact sales',
  contactHref,
  callLabel = 'Book a call',
  callHref,
}: PricingEnterpriseProps) {
  return (
    <section className="px-6 py-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-br from-surface-raised to-surface-sunken p-10 shadow-lg">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Enterprise
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              {headline}
            </h2>
            {body ? (
              <p className="mt-3 text-base text-muted-foreground">{body}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={contactHref}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {contactLabel}
              </a>
              {callHref ? (
                <a
                  href={callHref}
                  className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  {callLabel}
                </a>
              ) : null}
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-primary">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  )
}
