export type HeroMobileFirstProps = {
  heading: string
  subheading?: string
  phoneImageUrl: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  badges?: string[]
}

export function HeroMobileFirst({
  heading,
  subheading,
  phoneImageUrl,
  primaryCtaLabel,
  primaryCtaHref = '#',
  badges = [],
}: HeroMobileFirstProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            {heading}
          </h1>
          {subheading ? (
            <p className="mb-6 text-lg text-muted-foreground">{subheading}</p>
          ) : null}
          {primaryCtaLabel ? (
            <a
              href={primaryCtaHref}
              className="inline-block rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
            >
              {primaryCtaLabel}
            </a>
          ) : null}
          {badges.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative mx-auto w-full max-w-xs">
          <div className="aspect-[9/19] overflow-hidden rounded-[2.5rem] border-[10px] border-foreground bg-foreground shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phoneImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground"
          />
        </div>
      </div>
    </section>
  )
}
