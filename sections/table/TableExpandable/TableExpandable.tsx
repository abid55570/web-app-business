export type TableExpandableRow = {
  id: string
  cells: string[]
  detail: string
}

export type TableExpandableProps = {
  headers: string[]
  rows: TableExpandableRow[]
}

export function TableExpandable({
  headers,
  rows,
}: TableExpandableProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-overlay">
            <tr>
              <th className="w-8" />
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-2 py-3">
                  <details>
                    <summary className="cursor-pointer list-none text-muted-foreground">
                      ▸
                    </summary>
                    <div className="absolute mt-2 max-w-md rounded-lg border border-border bg-surface-raised p-3 text-xs text-muted-foreground shadow-xl">
                      {r.detail}
                    </div>
                  </details>
                </td>
                {r.cells.map((c, i) => (
                  <td key={i} className="px-4 py-3 text-foreground">
                    {c}
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
