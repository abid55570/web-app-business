export type CalloutProps = {
  variant?: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  children?: React.ReactNode
}

const PALETTE: Record<NonNullable<CalloutProps['variant']>, { bg: string; bar: string; icon: string }> = {
  note: { bg: 'bg-blue-50 text-blue-900', bar: 'border-l-blue-500', icon: 'ℹ' },
  tip: { bg: 'bg-emerald-50 text-emerald-900', bar: 'border-l-emerald-500', icon: '💡' },
  warning: { bg: 'bg-amber-50 text-amber-900', bar: 'border-l-amber-500', icon: '⚠' },
  danger: { bg: 'bg-red-50 text-red-900', bar: 'border-l-red-500', icon: '⛔' },
}

export function Callout({
  variant = 'note',
  title,
  children,
}: CalloutProps) {
  const p = PALETTE[variant]
  return (
    <aside
      className={`my-6 flex gap-3 rounded-r-lg border-l-4 px-5 py-4 ${p.bg} ${p.bar}`}
    >
      <span aria-hidden className="text-lg leading-tight">
        {p.icon}
      </span>
      <div className="flex-1 text-sm">
        {title ? <p className="mb-1 font-semibold">{title}</p> : null}
        <div className="opacity-90">{children}</div>
      </div>
    </aside>
  )
}
