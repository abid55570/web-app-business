export type DividerLabeledProps = {
  label: string
  variant?: 'line' | 'dotted' | 'gradient'
}

export function DividerLabeled({
  label,
  variant = 'line',
}: DividerLabeledProps) {
  const lineClass =
    variant === 'dotted'
      ? 'border-t-2 border-dotted border-border'
      : variant === 'gradient'
      ? 'h-px bg-gradient-to-r from-transparent via-border to-transparent'
      : 'border-t border-border'
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center gap-3">
        <span className={`flex-1 ${lineClass}`} />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={`flex-1 ${lineClass}`} />
      </div>
    </div>
  )
}
