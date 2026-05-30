export type SpecsListItem = { label: string; value: string }

export type SpecsListProps = {
  heading?: string
  items: SpecsListItem[]
}

export function SpecsList({ heading, items }: SpecsListProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      {heading ? (
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <dl className="mx-auto max-w-2xl divide-y divide-border">
        {items.map((it, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="text-sm text-muted-foreground">{it.label}</dt>
            <dd className="text-sm font-medium text-foreground sm:col-span-2">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
