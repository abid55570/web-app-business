export type FaqSearchableItem = {
  q: string
  a: string
  category?: string
}

export type FaqSearchableProps = {
  heading: string
  searchPlaceholder?: string
  items: FaqSearchableItem[]
}

export function FaqSearchable({
  heading,
  searchPlaceholder = 'Search the docs…',
  items,
}: FaqSearchableProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-3xl font-bold text-foreground">{heading}</h2>
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <ul className="mt-8 divide-y divide-border">
          {items.map((it, i) => (
            <li key={i} className="py-4">
              <details className="group">
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <div>
                    {it.category ? (
                      <span className="mb-1 inline-block rounded-full bg-accent/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {it.category}
                      </span>
                    ) : null}
                    <p className="font-semibold text-foreground">{it.q}</p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-0.5 text-xl text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{it.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
