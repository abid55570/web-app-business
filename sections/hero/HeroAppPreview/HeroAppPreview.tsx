export type HeroAppPreviewProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  secondaryLabel?: string
  secondaryHref?: string
  phoneScreenshotUrl: string
}

export function HeroAppPreview({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  phoneScreenshotUrl,
}: HeroAppPreviewProps) {
  return (
    <section className="overflow-hidden px-6 py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={ctaHref}
              className="inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
            >
              {ctaLabel} →
            </a>
            {secondaryLabel && secondaryHref ? (
              <a
                href={secondaryHref}
                className="inline-flex items-center rounded-lg border border-border bg-surface-raised px-7 py-3 text-base font-semibold text-foreground hover:bg-accent"
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xs">
          <div className="rounded-[2.5rem] border-[10px] border-foreground bg-foreground shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phoneScreenshotUrl}
              alt=""
              className="aspect-[9/19] w-full rounded-[1.75rem] object-cover"
            />
          </div>
          <span
            aria-hidden
            className="absolute inset-x-0 top-1.5 mx-auto h-1.5 w-20 rounded-full bg-foreground"
          />
        </div>
      </div>
    </section>
  )
}
