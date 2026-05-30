export type HealthCheck = {
  label: string
  status: 'ok' | 'warn' | 'fail' | 'unknown'
  detail?: string
}

export type HealthIndicatorsProps = {
  heading?: string
  checks: HealthCheck[]
}

const COLOR: Record<HealthCheck['status'], { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'OK' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'WARN' },
  fail: { dot: 'bg-red-500', text: 'text-red-700', label: 'FAIL' },
  unknown: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground', label: '—' },
}

export function HealthIndicators({
  heading = 'System health',
  checks,
}: HealthIndicatorsProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{heading}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((c, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 flex-none rounded-full ${COLOR[c.status].dot}`}
              />
              <p className="text-sm font-medium text-foreground">{c.label}</p>
            </div>
            <p className={`text-xs font-mono font-bold uppercase ${COLOR[c.status].text}`}>
              {COLOR[c.status].label}
              {c.detail ? (
                <span className="ml-1 font-normal opacity-80">· {c.detail}</span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
