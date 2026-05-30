export type RotatorQuote = {
  id: string
  quote: string
  authorName: string
  authorRole: string
}

export type TestimonialQuoteRotatorProps = {
  heading?: string
  quotes: RotatorQuote[]
  groupId: string
}

export function TestimonialQuoteRotator({
  heading,
  quotes,
  groupId,
}: TestimonialQuoteRotatorProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-3xl">
        {quotes.map((q, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${q.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/q sr-only"
          />
        ))}
        <div className="overflow-hidden">
          {quotes.map((q) => (
            <figure
              key={q.id}
              className="hidden text-center peer-checked/q:block"
            >
              <blockquote className="text-xl font-medium leading-snug text-foreground lg:text-2xl">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold text-foreground">
                  {q.authorName}
                </span>
                <span className="text-muted-foreground"> · {q.authorRole}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <nav
          aria-label="Quote pagination"
          className="mt-6 flex justify-center gap-2"
        >
          {quotes.map((q, i) => (
            <label
              key={i}
              htmlFor={`${groupId}-${q.id}`}
              className="h-2 w-8 cursor-pointer rounded-full bg-border peer-checked/q:bg-primary hover:bg-primary/60"
            />
          ))}
        </nav>
      </div>
    </section>
  )
}
