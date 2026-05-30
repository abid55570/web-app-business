export type HeroProductDemoProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  embedUrl?: string
  posterUrl?: string
}

export function HeroProductDemo({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  embedUrl,
  posterUrl,
}: HeroProductDemoProps) {
  return (
    <section className="px-6 pt-20 pb-12">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
      <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface-sunken shadow-2xl">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Product demo"
            className="aspect-video w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        ) : posterUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={posterUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        ) : null}
      </div>
    </section>
  )
}
