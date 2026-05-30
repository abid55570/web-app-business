export type FeatureMatrixLgCell = {
  row: string
  col: string
  value: string | boolean
}

export type FeatureMatrixLgProps = {
  heading?: string
  rows: string[]
  cols: string[]
  cells: FeatureMatrixLgCell[]
}

export function FeatureMatrixLg({
  heading,
  rows,
  cols,
  cells,
}: FeatureMatrixLgProps) {
  const lookup = new Map<string, string | boolean>()
  for (const c of cells) lookup.set(`${c.row}|${c.col}`, c.value)
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-6xl overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border p-3 text-left text-xs font-bold uppercase text-muted-foreground" />
              {cols.map((c) => (
                <th
                  key={c}
                  className="border-b border-border p-3 text-center text-sm font-bold text-foreground"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <th className="border-b border-border bg-surface-overlay p-3 text-left text-sm font-medium text-foreground">
                  {r}
                </th>
                {cols.map((c) => {
                  const v = lookup.get(`${r}|${c}`)
                  return (
                    <td
                      key={c}
                      className="border-b border-border p-3 text-center text-sm"
                    >
                      {typeof v === 'boolean' ? (
                        v ? (
                          <span className="text-success-fg">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : v ? (
                        <span className="font-mono text-foreground">{v}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
