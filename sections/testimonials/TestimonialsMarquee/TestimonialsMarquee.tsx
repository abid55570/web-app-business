export type MarqueeQuote = {
  quote: string
  name: string
  role?: string
  avatarUrl?: string
}

export type TestimonialsMarqueeProps = {
  heading?: string
  quotes: MarqueeQuote[]
}

export function TestimonialsMarquee({
  heading,
  quotes,
}: TestimonialsMarqueeProps) {
  // Duplicate quotes for a seamless loop.
  const doubled = [...quotes, ...quotes]
  return (
    <section className="overflow-hidden py-12">
      {heading ? (
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground lg:text-3xl">
          {heading}
        </h2>
      ) : null}
      <div
        className="flex gap-4"
        style={{
          animation: 'marquee 40s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((q, i) => (
          <article
            key={i}
            className="w-80 shrink-0 rounded-lg border border-border bg-surface-raised p-5"
          >
            <p className="mb-4 text-sm text-foreground">“{q.quote}”</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {q.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={q.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span>
                <span className="font-semibold text-foreground">{q.name}</span>
                {q.role ? <span> · {q.role}</span> : null}
              </span>
            </div>
          </article>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  )
}
