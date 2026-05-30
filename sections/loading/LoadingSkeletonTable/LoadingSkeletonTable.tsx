export type LoadingSkeletonTableProps = {
  rows?: number
  cols?: number
  showHeader?: boolean
}

export function LoadingSkeletonTable({
  rows = 6,
  cols = 4,
  showHeader = true,
}: LoadingSkeletonTableProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          {showHeader ? (
            <thead className="bg-surface-overlay">
              <tr>
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="p-3">
                    <span className="block h-3 w-20 animate-pulse rounded bg-border" />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-t border-border">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="p-3">
                    <span
                      className="block h-3 animate-pulse rounded bg-surface-overlay"
                      style={{ width: `${60 + ((r + c) % 4) * 10}%` }}
                    />
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
