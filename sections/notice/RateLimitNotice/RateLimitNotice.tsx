export type RateLimitNoticeProps = {
  used: number
  limit: number
  resetAt: string
  upgradeHref?: string
}

export function RateLimitNotice({
  used,
  limit,
  resetAt,
  upgradeHref,
}: RateLimitNoticeProps) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const variant = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'info'
  const palette = {
    info: { bar: 'bg-blue-500', wrap: 'border-l-blue-500 bg-blue-50 text-blue-900' },
    warning: {
      bar: 'bg-amber-500',
      wrap: 'border-l-amber-500 bg-amber-50 text-amber-900',
    },
    danger: { bar: 'bg-red-500', wrap: 'border-l-red-500 bg-red-50 text-red-900' },
  }[variant]
  return (
    <aside
      role="status"
      className={`rounded-r-lg border-l-4 px-5 py-4 ${palette.wrap}`}
    >
      <p className="text-sm font-semibold">
        {pct >= 100 ? 'Rate limit reached' : `Approaching rate limit (${pct}%)`}
      </p>
      <p className="mt-1 text-xs">
        Used {used} of {limit} this window. Resets {resetAt}.
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/40">
        <span
          className={`block h-full ${palette.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {upgradeHref ? (
        <a
          href={upgradeHref}
          className="mt-2 inline-block text-xs font-semibold underline"
        >
          Increase limit →
        </a>
      ) : null}
    </aside>
  )
}
