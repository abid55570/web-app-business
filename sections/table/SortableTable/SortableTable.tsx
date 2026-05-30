export type SortableColumn = {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

export type SortableTableProps = {
  caption?: string
  columns: SortableColumn[]
  rows: Array<Record<string, string | number>>
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export function SortableTable({
  caption,
  columns,
  rows,
  sortBy,
  sortDir = 'asc',
}: SortableTableProps) {
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
            {columns.map((c, i) => {
              const isSorted = sortBy === c.key
              const indicator = isSorted ? (sortDir === 'asc' ? '↑' : '↓') : '↕'
              return (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-3 font-semibold text-foreground ${
                    c.align === 'right'
                      ? 'text-right'
                      : c.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {c.sortable ? (
                    <a
                      href={`?sort=${c.key}&dir=${isSorted && sortDir === 'asc' ? 'desc' : 'asc'}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      {c.label}
                      <span
                        aria-hidden
                        className={
                          isSorted ? 'text-primary' : 'text-muted-foreground/60'
                        }
                      >
                        {indicator}
                      </span>
                    </a>
                  ) : (
                    c.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-accent/30">
              {columns.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 text-foreground ${
                    c.align === 'right'
                      ? 'text-right'
                      : c.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
