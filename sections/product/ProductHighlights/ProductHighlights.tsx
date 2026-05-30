export type ProductHighlightsHighlight = {
  icon?: string
  title: string
  body: string
}

export type ProductHighlightsProps = {
  heading?: string
  highlights: ProductHighlightsHighlight[]
}

export function ProductHighlights({
  heading,
  highlights,
}: ProductHighlightsProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        {highlights.map((h, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-lg text-primary"
            >
              {h.icon ?? '★'}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {h.title}
              </h3>
              <p className="text-sm text-muted-foreground">{h.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
