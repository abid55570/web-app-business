export type FeatureCarouselItem = {
  title: string
  body: string
  imageUrl?: string
  ctaLabel?: string
  ctaHref?: string
}

export type FeatureCarouselProps = {
  heading?: string
  items: FeatureCarouselItem[]
}

export function FeatureCarousel({ heading, items }: FeatureCarouselProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-6xl text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-6xl">
        <ol className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {items.map((it, i) => (
            <li
              key={i}
              className="w-72 flex-none snap-start overflow-hidden rounded-xl border border-border bg-surface-raised"
            >
              {it.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={it.imageUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <p className="font-semibold text-foreground">{it.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
                {it.ctaLabel && it.ctaHref ? (
                  <a
                    href={it.ctaHref}
                    className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    {it.ctaLabel} →
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
