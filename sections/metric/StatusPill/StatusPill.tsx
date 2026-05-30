export type StatusPillProps = {
  label: string
  value: string
  variant?: 'neutral' | 'positive' | 'negative' | 'warning'
}

const VARIANT: Record<NonNullable<StatusPillProps['variant']>, string> = {
  neutral: 'bg-surface-sunken text-foreground',
  positive: 'bg-emerald-100 text-emerald-800',
  negative: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-900',
}

export function StatusPill({
  label,
  value,
  variant = 'neutral',
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        VARIANT[variant]
      }`}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-mono">{value}</span>
    </span>
  )
}
