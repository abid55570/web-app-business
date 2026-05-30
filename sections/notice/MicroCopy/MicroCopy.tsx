export type MicroCopyProps = {
  variant?: 'note' | 'tip' | 'warning'
  body: string
}

const PALETTE: Record<NonNullable<MicroCopyProps['variant']>, string> = {
  note: 'text-muted-foreground',
  tip: 'text-emerald-700',
  warning: 'text-amber-700',
}

const ICON: Record<NonNullable<MicroCopyProps['variant']>, string> = {
  note: 'ℹ',
  tip: '💡',
  warning: '⚠',
}

export function MicroCopy({ variant = 'note', body }: MicroCopyProps) {
  return (
    <p className={`inline-flex items-start gap-1.5 text-xs ${PALETTE[variant]}`}>
      <span aria-hidden className="text-sm leading-tight">{ICON[variant]}</span>
      {body}
    </p>
  )
}
