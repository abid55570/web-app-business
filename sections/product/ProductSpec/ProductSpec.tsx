export type SpecItem = { label: string; value: string }
export type SpecGroup = { heading: string; items: SpecItem[] }

export type ProductSpecProps = {
  heading?: string
  groups: SpecGroup[]
}

export function ProductSpec({
  heading = 'Specifications',
  groups,
}: ProductSpecProps) {
  return (
    <section className="px-6 py-12 lg:px-12 lg:py-16">
      <h2 className="mb-8 text-2xl font-bold text-foreground lg:text-3xl">
        {heading}
      </h2>
      <div className="mx-auto max-w-3xl divide-y divide-border">
        {groups.map((g, i) => (
          <div key={i} className="py-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {g.heading}
            </p>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {g.items.map((it, j) => (
                <div key={j} className="contents">
                  <dt className="text-sm text-muted-foreground">{it.label}</dt>
                  <dd className="text-sm font-medium text-foreground sm:col-span-2">
                    {it.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
