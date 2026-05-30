export type PricingFreemiumProps = {
  headline?: string
  freeName?: string
  freeBullets: string[]
  freeCtaLabel?: string
  freeCtaHref: string
  paidName: string
  paidPrice: string
  paidCadence: string
  paidBullets: string[]
  paidCtaLabel?: string
  paidCtaHref: string
}

export function PricingFreemium({
  headline,
  freeName = 'Free',
  freeBullets,
  freeCtaLabel = 'Start free',
  freeCtaHref,
  paidName,
  paidPrice,
  paidCadence,
  paidBullets,
  paidCtaLabel = 'Go pro',
  paidCtaHref,
}: PricingFreemiumProps) {
  return (
    <section className="px-6 py-16">
      {headline ? (
        <h2 className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold text-foreground">
          {headline}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface-raised p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {freeName}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">$0</p>
          <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
            {freeBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✓</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href={freeCtaHref}
            className="mt-6 block rounded-md border border-border bg-background px-5 py-2.5 text-center text-sm font-semibold text-foreground hover:bg-accent"
          >
            {freeCtaLabel}
          </a>
        </article>
        <article className="rounded-2xl bg-primary p-7 text-primary-foreground shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {paidName}
          </p>
          <p className="mt-2 text-3xl font-bold">
            {paidPrice}
            <span className="ml-1 text-base font-normal opacity-80">
              /{paidCadence}
            </span>
          </p>
          <ul className="mt-5 space-y-1.5 text-sm opacity-95">
            {paidBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✓</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href={paidCtaHref}
            className="mt-6 block rounded-md bg-surface-raised px-5 py-2.5 text-center text-sm font-semibold text-foreground hover:opacity-90"
          >
            {paidCtaLabel}
          </a>
        </article>
      </div>
    </section>
  )
}
