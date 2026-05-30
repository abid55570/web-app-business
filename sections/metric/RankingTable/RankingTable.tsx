export type RankingRow = {
  rank: number
  name: string
  avatarUrl?: string
  score: string | number
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

export type RankingTableProps = {
  caption?: string
  scoreLabel?: string
  rows: RankingRow[]
}

const TREND: Record<NonNullable<RankingRow['trend']>, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  flat: 'text-muted-foreground',
}

export function RankingTable({
  caption,
  scoreLabel = 'Score',
  rows,
}: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        {caption ? (
          <caption className="border-b border-border bg-surface-sunken px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {caption}
          </caption>
        ) : null}
        <thead className="bg-surface-sunken">
          <tr>
            <th scope="col" className="w-12 px-4 py-3 text-center font-semibold text-muted-foreground">
              #
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-muted-foreground">
              {scoreLabel}
            </th>
            <th scope="col" className="w-24 px-4 py-3 text-right font-semibold text-muted-foreground">
              Δ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface-raised">
          {rows.map((r) => (
            <tr key={r.rank}>
              <td className="px-4 py-3 text-center font-bold text-foreground">
                {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {r.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="font-medium text-foreground">{r.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-foreground">
                {r.score}
              </td>
              <td className={`px-4 py-3 text-right text-xs font-semibold ${
                TREND[r.trend ?? 'flat']
              }`}>
                {r.delta ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
