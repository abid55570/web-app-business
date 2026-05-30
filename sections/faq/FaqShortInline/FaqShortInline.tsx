export type FaqShortInlineItem = {
  q: string
  a: string
}

export type FaqShortInlineProps = {
  heading?: string
  items: FaqShortInlineItem[]
}

export function FaqShortInline({ heading, items }: FaqShortInlineProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {heading ? (
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            {heading}
          </h2>
        ) : null}
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-semibold text-foreground">
                {it.q}
              </dt>
              <dd className="text-sm text-muted-foreground">{it.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
