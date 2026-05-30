export type HeroCenteredProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  imageUrl?: string
}

export function HeroCentered({
  eyebrow,
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
  secondaryLabel,
  secondaryHref,
  imageUrl,
}: HeroCenteredProps) {
  return (
    <section className="px-6 py-16 text-center lg:py-24">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold leading-tight text-foreground lg:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mb-8 max-w-prose text-lg text-muted-foreground">
        {body}
      </p>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        <a
          href={ctaHref}
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </a>
        {secondaryLabel ? (
          <a
            href={secondaryHref ?? '#'}
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            {secondaryLabel}
          </a>
        ) : null}
      </div>
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt=""
          className="mx-auto max-h-[500px] w-full max-w-5xl rounded-lg object-cover shadow-lg"
        />
      ) : null}
    </section>
  )
}
