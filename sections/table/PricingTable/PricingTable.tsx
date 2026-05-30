export type PricingTablePlan = {
  name: string
  price: string
  cadence?: string
  highlighted?: boolean
}

export type PricingTableRow = {
  feature: string
  values: Array<string | boolean>
}

export type PricingTableProps = {
  caption?: string
  plans: PricingTablePlan[]
  rows: PricingTableRow[]
}

export function PricingTable({ caption, plans, rows }: PricingTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        {caption ? (
          <caption className="border-b border-border bg-surface-sunken px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {caption}
          </caption>
        ) : null}
        <thead className="bg-surface-sunken">
          <tr>
            <th scope="col" className="w-1/3 px-4 py-3 text-left font-semibold text-muted-foreground">
              Feature
            </th>
            {plans.map((p, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-3 text-center font-semibold ${
                  p.highlighted ? 'text-primary' : 'text-foreground'
                }`}
              >
                <p>{p.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {p.price}
                  {p.cadence ? `/${p.cadence}` : ''}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i}>
              <th
                scope="row"
                className="px-4 py-3 text-left font-medium text-foreground"
              >
                {r.feature}
              </th>
              {r.values.map((v, j) => (
                <td key={j} className="px-4 py-3 text-center text-foreground">
                  {typeof v === 'boolean' ? (
                    v ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )
                  ) : (
                    v
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
