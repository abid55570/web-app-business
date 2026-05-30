export type StatusDotProps = {
  label: string
  status?: 'on' | 'off' | 'warn' | 'error'
  pulse?: boolean
}

const COLOR: Record<NonNullable<StatusDotProps['status']>, string> = {
  on: 'bg-emerald-500',
  off: 'bg-muted-foreground/40',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
}

export function StatusDot({
  label,
  status = 'on',
  pulse = false,
}: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span className="relative grid h-2 w-2 place-items-center">
        {pulse ? (
          <span
            aria-hidden
            className={`absolute h-full w-full animate-ping rounded-full opacity-60 ${COLOR[status]}`}
          />
        ) : null}
        <span
          aria-hidden
          className={`relative h-2 w-2 rounded-full ${COLOR[status]}`}
        />
      </span>
      {label}
    </span>
  )
}
