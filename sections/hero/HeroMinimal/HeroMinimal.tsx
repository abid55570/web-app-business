export type HeroMinimalProps = {
  eyebrow?: string
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function HeroMinimal({
  eyebrow,
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
}: HeroMinimalProps) {
  return (
    <section className="px-6 py-20 text-center lg:py-32">
      {eyebrow ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-bold leading-tight text-foreground lg:text-6xl">
        {headline}
      </h1>
      {body ? (
        <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
          {body}
        </p>
      ) : null}
      <a
        href={ctaHref}
        className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
      >
        {ctaLabel}
      </a>
    </section>
  )
}
