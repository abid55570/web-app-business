/**
 * TestimonialsCarousel — overflow-x-scroll + scroll-snap-type=x for swipe.
 * Cards 80% viewport on mobile, 33% on lg. No JS, no nav arrows; native
 * touch scroll handles it.
 */
export type CarouselQuote = {
  quote: string
  name: string
  role?: string
  avatarUrl?: string
  company?: string
}

export type TestimonialsCarouselProps = {
  heading?: string
  quotes: CarouselQuote[]
}

export function TestimonialsCarousel({
  heading = 'What customers say',
  quotes,
}: TestimonialsCarouselProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-10 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <ul
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {quotes.map((q, i) => (
          <li
            key={i}
            className="w-[80%] shrink-0 snap-start rounded-xl border border-border bg-surface-raised p-6 sm:w-[60%] lg:w-[33%]"
          >
            <blockquote className="mb-6 text-base leading-relaxed text-foreground">
              “{q.quote}”
            </blockquote>
            <div className="flex items-center gap-3">
              {q.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={q.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="text-sm">
                <p className="font-semibold text-foreground">{q.name}</p>
                {q.role || q.company ? (
                  <p className="text-muted-foreground">
                    {[q.role, q.company].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
