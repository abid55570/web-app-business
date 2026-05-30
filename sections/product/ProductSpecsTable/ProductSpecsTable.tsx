export type ProductSpecsTableProps = {
  heading?: string
  groups: { label: string; rows: { name: string; value: string }[] }[]
}
export function ProductSpecsTable({ heading, groups }: ProductSpecsTableProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {heading ? <h2 className="mb-6 text-2xl font-bold text-foreground">{heading}</h2> : null}
        {groups.map((g, i) => (
          <div key={i} className="mb-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{g.label}</h3>
            <dl className="overflow-hidden rounded-lg border border-border">
              {g.rows.map((r, j) => (
                <div key={j} className="grid grid-cols-2 border-b border-border last:border-0">
                  <dt className="bg-surface-overlay px-4 py-2 text-sm font-medium text-foreground">{r.name}</dt>
                  <dd className="px-4 py-2 text-sm text-muted-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
