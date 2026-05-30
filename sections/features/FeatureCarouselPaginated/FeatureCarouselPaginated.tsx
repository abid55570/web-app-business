export type FeatureCarouselPage = {
  id: string
  title: string
  items: Array<{ icon?: string; title: string; body: string }>
}

export type FeatureCarouselPaginatedProps = {
  heading?: string
  pages: FeatureCarouselPage[]
  groupId: string
}

export function FeatureCarouselPaginated({
  heading,
  pages,
  groupId,
}: FeatureCarouselPaginatedProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-5xl">
        {pages.map((p, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${p.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/p sr-only"
          />
        ))}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
          {pages.map((p) => (
            <div key={p.id} className="hidden p-8 peer-checked/p:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {p.title}
              </p>
              <ul className="mt-5 grid gap-5 sm:grid-cols-3">
                {p.items.map((it, j) => (
                  <li key={j} className="text-center">
                    <span
                      aria-hidden
                      className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-lg text-primary"
                    >
                      {it.icon ?? '✦'}
                    </span>
                    <p className="mt-3 font-semibold text-foreground">
                      {it.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {it.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <nav className="mt-4 flex justify-center gap-2">
          {pages.map((p) => (
            <label
              key={p.id}
              htmlFor={`${groupId}-${p.id}`}
              className="cursor-pointer rounded-full bg-border px-3 py-1 text-xs font-semibold text-muted-foreground peer-checked/p:bg-primary peer-checked/p:text-primary-foreground"
            >
              {p.title}
            </label>
          ))}
        </nav>
      </div>
    </section>
  )
}
