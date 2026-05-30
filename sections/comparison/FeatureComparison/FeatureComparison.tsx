/**
 * FeatureComparison — pure HTML table. First column = the user's product.
 * Cells accept `true` (✓), `false` (✕), or a string (label).
 */
export type ComparisonColumn = {
  name: string
  highlight?: boolean
}

export type ComparisonRow = {
  feature: string
  values: Array<boolean | string>
}

export type FeatureComparisonProps = {
  heading?: string
  columns: ComparisonColumn[]
  rows: ComparisonRow[]
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true)
    return <span className="text-primary" aria-label="yes">✓</span>
  if (v === false)
    return <span className="text-muted-foreground" aria-label="no">—</span>
  return <span className="text-foreground">{v}</span>
}

export function FeatureComparison({
  heading = 'How we compare',
  columns,
  rows,
}: FeatureComparisonProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-10 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <div className="mx-auto max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 text-left font-medium text-muted-foreground">
                Feature
              </th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`py-3 text-center font-semibold ${
                    c.highlight ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 font-medium text-foreground">{r.feature}</td>
                {r.values.map((v, j) => (
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
