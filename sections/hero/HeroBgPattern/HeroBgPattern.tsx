export type HeroBgPatternProps = {
  eyebrow?: string
  heading: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  patternColor?: string
}

export function HeroBgPattern({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
  patternColor = 'rgba(99,102,241,0.15)',
}: HeroBgPatternProps) {
  return (
    <section
      className="relative isolate overflow-hidden px-6 py-24 text-center"
      style={{
        backgroundImage: `radial-gradient(${patternColor} 1.4px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, var(--color-surface-base, #fff) 75%)',
        }}
      />
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold text-foreground sm:text-6xl">
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
          className="inline-block rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
        >
          {primaryCtaLabel}
        </a>
      ) : null}
    </section>
  )
}
