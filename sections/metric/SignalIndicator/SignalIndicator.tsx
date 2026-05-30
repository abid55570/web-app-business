export type SignalIndicatorProps = {
  label: string
  level: 0 | 1 | 2 | 3 | 4
  helper?: string
}

const LABEL: Record<SignalIndicatorProps['level'], string> = {
  0: 'No signal',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Excellent',
}

const COLOR: Record<SignalIndicatorProps['level'], string> = {
  0: 'text-red-600',
  1: 'text-red-500',
  2: 'text-amber-500',
  3: 'text-emerald-500',
  4: 'text-emerald-600',
}

export function SignalIndicator({
  label,
  level,
  helper,
}: SignalIndicatorProps) {
  return (
    <article className="inline-flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-2">
      <span aria-hidden className={`flex items-end gap-0.5 ${COLOR[level]}`}>
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={`w-1 rounded-sm ${
              level >= bar ? 'bg-current' : 'bg-current/20'
            }`}
            style={{ height: `${bar * 4 + 4}px` }}
          />
        ))}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`text-sm font-semibold ${COLOR[level]}`}>
          {LABEL[level]}
          {helper ? (
            <span className="ml-1.5 font-normal text-muted-foreground">
              · {helper}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  )
}
