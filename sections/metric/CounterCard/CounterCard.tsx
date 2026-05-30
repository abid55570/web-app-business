export type CounterCardProps = {
  label: string
  value: string
  suffix?: string
  icon?: string
  accentColor?: 'primary' | 'success' | 'warning' | 'info'
}

const ACCENT: Record<NonNullable<CounterCardProps['accentColor']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

export function CounterCard({
  label,
  value,
  suffix,
  icon,
  accentColor = 'primary',
}: CounterCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-5">
      <span
        aria-hidden
        className={`grid h-12 w-12 flex-none place-items-center rounded-full text-xl ${
          ACCENT[accentColor]
        }`}
      >
        {icon ?? '#'}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-3xl font-bold text-foreground">
          <span className="animate-fade-in-up">{value}</span>
          {suffix ? (
            <span className="ml-1 text-lg font-normal text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  )
}
