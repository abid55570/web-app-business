export type ScrollGalleryItem = {
  imageUrl: string
  alt?: string
  title?: string
  subtitle?: string
  href?: string
}

export type ScrollGalleryHorizontalProps = {
  heading?: string
  items: ScrollGalleryItem[]
}

export function ScrollGalleryHorizontal({
  heading,
  items,
}: ScrollGalleryHorizontalProps) {
  return (
    <section className="py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-6xl px-6 text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
        {items.map((it, i) => {
          const card = (
            <div className="relative h-80 w-72 flex-none overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt={it.alt ?? ''}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {(it.title || it.subtitle) ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 py-4 text-white">
                  {it.title ? (
                    <p className="font-semibold">{it.title}</p>
                  ) : null}
                  {it.subtitle ? (
                    <p className="text-xs opacity-90">{it.subtitle}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
          return (
            <li key={i} className="snap-start">
              {it.href ? (
                <a href={it.href} className="group block">
                  {card}
                </a>
              ) : (
                card
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
