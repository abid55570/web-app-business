export type HeroDiagonalSplitProps = {
  eyebrow?: string
  heading: string
  subheading?: string
  imageUrl: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
}

export function HeroDiagonalSplit({
  eyebrow,
  heading,
  subheading,
  imageUrl,
  primaryCtaLabel,
  primaryCtaHref = '#',
}: HeroDiagonalSplitProps) {
  return (
    <section className="relative isolate overflow-hidden bg-surface-raised">
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 w-1/2"
        style={{
          background: `url("${imageUrl}") center/cover`,
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2">
        <div className="max-w-lg">
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            {heading}
          </h1>
          {subheading ? (
            <p className="mb-8 text-lg text-muted-foreground">{subheading}</p>
          ) : null}
          {primaryCtaLabel ? (
            <a
              href={primaryCtaHref}
              className="inline-block rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
            >
              {primaryCtaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
