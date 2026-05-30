export type HeroBgGridProps = {
  heading: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  lineColor?: string
}

export function HeroBgGrid({
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref = '#',
  lineColor = 'rgba(99,102,241,0.15)',
}: HeroBgGridProps) {
  return (
    <section
      className="relative isolate overflow-hidden px-6 py-28 text-center"
      style={{
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, var(--color-surface-base, #fff) 70%)',
        }}
      />
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
