export type GaugeProps = {
  label: string
  value: number
  min?: number
  max?: number
  unit?: string
  thresholds?: { warning: number; danger: number }
}

export function Gauge({
  label,
  value,
  min = 0,
  max = 100,
  unit = '%',
  thresholds = { warning: 60, danger: 85 },
}: GaugeProps) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = -90 + pct * 180
  const color =
    value >= thresholds.danger
      ? '#dc2626'
      : value >= thresholds.warning
        ? '#f59e0b'
        : '#10b981'
  return (
    <article className="rounded-xl border border-border bg-surface-raised p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <svg viewBox="0 0 100 60" className="mx-auto mt-2 w-40">
        <path
          d="M10,50 A40,40 0 0,1 90,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-surface-sunken"
        />
        <path
          d="M10,50 A40,40 0 0,1 90,50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="126"
          strokeDashoffset={(1 - pct) * 126}
        />
        <line
          x1="50"
          y1="50"
          x2={50 + 36 * Math.cos((angle * Math.PI) / 180)}
          y2={50 + 36 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground"
        />
        <circle cx="50" cy="50" r="3" className="fill-foreground" />
      </svg>
      <p className="mt-3 text-2xl font-bold text-foreground">
        {value}
        <span className="text-base font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
    </article>
  )
}
