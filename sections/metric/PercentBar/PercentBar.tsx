export type PercentBarProps = {
  label: string
  percent: number
  helper?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const BAR_COLOR: Record<NonNullable<PercentBarProps['color']>, string> = {
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export function PercentBar({
  label,
  percent,
  helper,
  color = 'primary',
}: PercentBarProps) {
  const safe = Math.max(0, Math.min(100, percent))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {safe}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className={`block h-full rounded-full ${BAR_COLOR[color]}`}
          style={{ width: `${safe}%` }}
        />
      </div>
      {helper ? (
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}
