export type StatusBadgeProps = {
  label: string
  status?: 'operational' | 'degraded' | 'down' | 'maintenance'
  pulse?: boolean
}

const PALETTE: Record<NonNullable<StatusBadgeProps['status']>, string> = {
  operational: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  degraded: 'bg-amber-100 text-amber-900 border-amber-300',
  down: 'bg-red-100 text-red-900 border-red-300',
  maintenance: 'bg-blue-100 text-blue-900 border-blue-300',
}

const DOT: Record<NonNullable<StatusBadgeProps['status']>, string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  maintenance: 'bg-blue-500',
}

export function StatusBadge({
  label,
  status = 'operational',
  pulse = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${PALETTE[status]}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${DOT[status]}`}
          />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${DOT[status]}`}
        />
      </span>
      {label}
    </span>
  )
}
