export type Column = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

export type DataTableProps = {
  columns: Column[]
  rows: Record<string, unknown>[]
  caption?: string
}

export function DataTable({ columns, rows, caption }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption ? (
          <caption className="mb-2 text-left text-sm text-muted-foreground">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-border bg-surface-raised">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 text-${c.align ?? 'left'} text-xs font-semibold uppercase tracking-wide text-muted-foreground`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border even:bg-surface-overlay"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-2 text-${c.align ?? 'left'} text-foreground`}
                >
                  {String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
