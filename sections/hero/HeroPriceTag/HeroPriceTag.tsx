export type HeroPriceTagProps = {
  headline: string
  body: string
  price: string
  cadence?: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  badge?: string
}

export function HeroPriceTag({
  headline,
  body,
  price,
  cadence,
  ctaLabel,
  ctaHref,
  imageUrl,
  badge,
}: HeroPriceTagProps) {
  return (
    <section className="px-6 py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{body}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel} →
          </a>
        </div>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="aspect-square w-full rounded-2xl object-cover shadow-xl"
          />
          <div className="absolute right-4 top-4 rotate-6 rounded-xl bg-primary px-5 py-3 text-center text-primary-foreground shadow-lg">
            {badge ? (
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {badge}
              </p>
            ) : null}
            <p className="text-3xl font-bold">
              {price}
              {cadence ? (
                <span className="ml-0.5 text-xs font-normal opacity-80">
                  /{cadence}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
