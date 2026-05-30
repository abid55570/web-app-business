export type ProgressRingProps = {
  label: string
  value: number
  max?: number
  sublabel?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_PX: Record<NonNullable<ProgressRingProps['size']>, number> = {
  sm: 96,
  md: 140,
  lg: 200,
}

export function ProgressRing({
  label,
  value,
  max = 100,
  sublabel,
  size = 'md',
}: ProgressRingProps) {
  const px = SIZE_PX[size]
  const r = (px - 16) / 2
  const c = 2 * Math.PI * r
  const ratio = Math.max(0, Math.min(1, value / max))
  return (
    <article className="text-center">
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className="mx-auto -rotate-90"
      >
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-sunken"
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          className="text-primary"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="rotate-90 fill-foreground text-2xl font-bold"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          {Math.round(ratio * 100)}%
        </text>
      </svg>
      <p className="mt-3 font-semibold text-foreground">{label}</p>
      {sublabel ? (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </article>
  )
}
