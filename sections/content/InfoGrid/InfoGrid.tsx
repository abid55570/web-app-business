export type InfoGridItem = {
  label: string
  value: string
  icon?: string
}

export type InfoGridProps = {
  heading?: string
  items: InfoGridItem[]
  columns?: 2 | 3 | 4
}

const COLS: Record<NonNullable<InfoGridProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export function InfoGrid({ heading, items, columns = 3 }: InfoGridProps) {
  return (
    <section className="my-8">
      {heading ? (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </h3>
      ) : null}
      <dl className={`grid gap-4 ${COLS[columns]}`}>
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface-raised p-4"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {it.icon ? <span aria-hidden>{it.icon}</span> : null}
              {it.label}
            </dt>
            <dd className="mt-1 text-base font-semibold text-foreground">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
