export type ProgressBarProps = {
  label: string
  value: number
  tone?: 'primary' | 'success' | 'warning' | 'error'
}

const TONE_CLASS: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function ProgressBar({
  label,
  value,
  tone = 'primary',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="px-6 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-muted-foreground">{clamped}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay"
        >
          <div
            className={`h-full rounded-full transition-all ${TONE_CLASS[tone]}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    </div>
  )
}
