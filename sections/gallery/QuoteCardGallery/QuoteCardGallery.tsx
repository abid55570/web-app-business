export type QuoteCardGalleryItem = {
  quote: string
  author: string
  source?: string
  accent?: 'primary' | 'success' | 'warning' | 'info'
}

export type QuoteCardGalleryProps = {
  heading?: string
  quotes: QuoteCardGalleryItem[]
}

const ACCENT: Record<NonNullable<QuoteCardGalleryItem['accent']>, string> = {
  primary: 'border-t-primary',
  success: 'border-t-emerald-500',
  warning: 'border-t-amber-500',
  info: 'border-t-blue-500',
}

export function QuoteCardGallery({
  heading,
  quotes,
}: QuoteCardGalleryProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <li
            key={i}
            className={`rounded-xl border border-border border-t-4 bg-surface-raised p-5 ${
              ACCENT[q.accent ?? 'primary']
            }`}
          >
            <p className="text-sm leading-relaxed text-foreground">
              &ldquo;{q.quote}&rdquo;
            </p>
            <p className="mt-3 text-xs">
              <span className="font-semibold text-foreground">{q.author}</span>
              {q.source ? (
                <span className="text-muted-foreground"> · {q.source}</span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
