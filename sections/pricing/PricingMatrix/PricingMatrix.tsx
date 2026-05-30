export type MatrixPlan = {
  name: string
  highlight?: boolean
}

export type MatrixRow = {
  feature: string
  values: Array<boolean | string>
}

export type PricingMatrixProps = {
  heading?: string
  plans: MatrixPlan[]
  rows: MatrixRow[]
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <span className="text-primary">✓</span>
  if (v === false) return <span className="text-muted-foreground">—</span>
  return <span className="text-foreground">{v}</span>
}

export function PricingMatrix({
  heading = 'Compare plans',
  plans,
  rows,
}: PricingMatrixProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <h2 className="mb-8 text-center text-2xl font-bold text-foreground lg:text-3xl">
        {heading}
      </h2>
      <div className="mx-auto max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Feature
              </th>
              {plans.map((p, i) => (
                <th
                  key={i}
                  className={`py-3 text-center text-sm font-semibold ${
                    p.highlight ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 text-foreground">{row.feature}</td>
                {row.values.map((v, j) => (
                  <td key={j} className="py-3 text-center">
                    <Cell v={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
