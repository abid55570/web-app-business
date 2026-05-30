export type CarouselDotsSlide = {
  imageUrl: string
  alt?: string
  caption?: string
}

export type CarouselDotsProps = {
  id: string
  slides: CarouselDotsSlide[]
}

export function CarouselDots({ id, slides }: CarouselDotsProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <ol
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl"
          id={id}
        >
          {slides.map((s, i) => (
            <li
              key={i}
              id={`${id}-slide-${i}`}
              className="relative w-full flex-none snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.alt ?? ''}
                className="aspect-[16/9] w-full object-cover"
              />
              {s.caption ? (
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-sm font-medium text-white">
                  {s.caption}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <nav
          aria-label="Carousel pagination"
          className="mt-4 flex justify-center gap-2"
        >
          {slides.map((_, i) => (
            <a
              key={i}
              href={`#${id}-slide-${i}`}
              aria-label={`Go to slide ${i + 1}`}
              className="h-2 w-2 rounded-full bg-muted-foreground/40 hover:bg-primary"
            />
          ))}
        </nav>
      </div>
    </section>
  )
}
