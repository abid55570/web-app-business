export type HeroTrustBarProps = {
  eyebrow?: string
  heading: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  trustLine?: string
  logos: { label: string }[]
}

export function HeroTrustBar({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
  trustLine = 'Trusted by teams at',
  logos,
}: HeroTrustBarProps) {
  return (
    <section className="px-6 py-20 text-center">
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold text-foreground sm:text-5xl">
        {heading}
      </h1>
      {subheading ? (
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          {subheading}
        </p>
      ) : null}
      {primaryCtaLabel ? (
        <a
          href={primaryCtaHref}
          className="mb-10 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          {primaryCtaLabel}
        </a>
      ) : null}
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {trustLine}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {logos.map((l, i) => (
            <span
              key={i}
              className="text-base font-bold text-muted-foreground opacity-70"
            >
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
