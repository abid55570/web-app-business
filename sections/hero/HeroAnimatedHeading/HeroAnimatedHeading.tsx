export type HeroAnimatedHeadingProps = {
  preHeadline?: string
  headline: string
  highlight?: string
  body: string
  ctaLabel: string
  ctaHref: string
}

export function HeroAnimatedHeading({
  preHeadline,
  headline,
  highlight,
  body,
  ctaLabel,
  ctaHref,
}: HeroAnimatedHeadingProps) {
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="mx-auto max-w-4xl text-center">
        {preHeadline ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            {preHeadline}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-6xl">
          {headline}{' '}
          {highlight ? (
            <span className="animate-fade-in-blur bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
        <div className="mt-10">
          <a
            href={ctaHref}
            className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
      </div>
    </section>
  )
}
