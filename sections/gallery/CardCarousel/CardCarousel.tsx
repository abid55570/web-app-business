export type CardCarouselItem = {
  imageUrl: string
  title: string
  subtitle?: string
  href: string
}

export type CardCarouselProps = {
  heading?: string
  items: CardCarouselItem[]
}

export function CardCarousel({ heading, items }: CardCarouselProps) {
  return (
    <section className="py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-6xl px-6 text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [scrollbar-width:thin] [perspective:1200px]"
      >
        {items.map((it, i) => (
          <li key={i} className="snap-start">
            <a
              href={it.href}
              className="block w-72 origin-center transition-transform hover:[transform:rotateY(-6deg)_translateZ(20px)]"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.imageUrl}
                  alt=""
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold text-foreground">{it.title}</p>
                  {it.subtitle ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {it.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
