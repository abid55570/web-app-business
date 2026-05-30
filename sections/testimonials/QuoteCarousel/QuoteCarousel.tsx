export type QuoteCarouselQuote = {
  body: string
  authorName: string
  authorRole?: string
}

export type QuoteCarouselProps = {
  heading?: string
  quotes: QuoteCarouselQuote[]
}

export function QuoteCarousel({ heading, quotes }: QuoteCarouselProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-2xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-4xl overflow-hidden">
        <ul className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
          {quotes.map((q, i) => (
            <li
              key={i}
              className="min-w-full snap-center rounded-2xl border border-border bg-surface-raised p-8 text-center"
            >
              <p className="mb-4 text-xl italic text-foreground">
                &ldquo;{q.body}&rdquo;
              </p>
              <p className="text-sm font-semibold text-foreground">
                {q.authorName}
              </p>
              {q.authorRole ? (
                <p className="text-xs text-muted-foreground">{q.authorRole}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
