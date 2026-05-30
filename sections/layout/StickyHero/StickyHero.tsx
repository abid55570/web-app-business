export type StickyHeroProps = {
  headline: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl?: string
}

export function StickyHero({
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
  imageUrl,
}: StickyHeroProps) {
  return (
    <>
      <section className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
              {headline}
            </h1>
            <p className="text-lg text-muted-foreground">{body}</p>
          </div>
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt=""
              className="rounded-lg object-cover shadow-lg"
            />
          ) : null}
        </div>
      </section>
      <div className="sticky bottom-4 z-20 px-6 lg:px-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-border bg-surface-raised/95 px-5 py-3 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold text-foreground">{headline}</p>
          <a
            href={ctaHref}
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
      </div>
    </>
  )
}
