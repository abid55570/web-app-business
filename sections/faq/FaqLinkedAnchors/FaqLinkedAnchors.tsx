export type FaqLinkedAnchorsItem = {
  id: string
  q: string
  a: string
}

export type FaqLinkedAnchorsProps = {
  heading?: string
  items: FaqLinkedAnchorsItem[]
}

export function FaqLinkedAnchors({
  heading,
  items,
}: FaqLinkedAnchorsProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading ? (
          <h2 className="mb-6 text-3xl font-bold text-foreground">{heading}</h2>
        ) : null}
        <nav className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Quick jump
          </p>
          <ul className="flex flex-wrap gap-2">
            {items.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-foreground hover:bg-surface-overlay"
                >
                  {it.q}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <dl className="space-y-8">
          {items.map((it) => (
            <div key={it.id} id={it.id}>
              <dt className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                <a
                  href={`#${it.id}`}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="Anchor link"
                >
                  #
                </a>
                {it.q}
              </dt>
              <dd className="text-base text-muted-foreground">{it.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
