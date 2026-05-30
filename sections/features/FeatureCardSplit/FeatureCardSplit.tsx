export type FeatureCardSplitItem = {
  title: string
  body: string
  bullets?: string[]
  imageUrl: string
}

export type FeatureCardSplitProps = {
  heading?: string
  items: FeatureCardSplitItem[]
}

export function FeatureCardSplit({
  heading,
  items,
}: FeatureCardSplitProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        {items.map((it, i) => (
          <article
            key={i}
            className="grid items-center gap-0 overflow-hidden rounded-2xl border border-border bg-surface-raised sm:grid-cols-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.imageUrl}
              alt=""
              className={`aspect-[4/3] w-full object-cover ${
                i % 2 === 0 ? '' : 'order-2'
              }`}
            />
            <div className="p-7">
              <h3 className="text-xl font-bold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
              {it.bullets?.length ? (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {it.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span aria-hidden className="text-primary">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
