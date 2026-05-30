export type CtaPricingLinkProps = {
  eyebrow?: string
  headline: string
  body?: string
  primaryLabel?: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function CtaPricingLink({
  eyebrow = 'Pricing',
  headline,
  body,
  primaryLabel = 'See plans',
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaPricingLinkProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-raised p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-foreground">{headline}</h2>
        {body ? (
          <p className="mx-auto mt-2 max-w-xl text-base text-muted-foreground">
            {body}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={primaryHref}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {primaryLabel} →
          </a>
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              className="rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
