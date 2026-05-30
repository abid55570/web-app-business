/**
 * HeroSplit — copy + dual CTA on the left, image on the right.
 *
 * Stacks vertically below `lg`; image hides on `sm` to keep mobile fast.
 * Pure presentational component — no module/data dependencies — so it
 * drops into any generated app's pages without wiring.
 */
export type HeroSplitProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  imageUrl?: string
}

export function HeroSplit({
  eyebrow,
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
  secondaryLabel,
  secondaryHref,
  imageUrl,
}: HeroSplitProps) {
  return (
    <section className="grid grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-28">
      <div className="flex flex-col justify-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mb-5 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mb-8 max-w-prose text-lg text-muted-foreground">
          {body}
        </p>
        <div className="flex flex-wrap gap-3">
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
      </div>
      {imageUrl ? (
        <div className="hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      ) : null}
    </section>
  )
}
