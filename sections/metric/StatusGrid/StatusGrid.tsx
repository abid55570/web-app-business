export type StatusGridService = {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  uptime: string
  lastCheckedAt: string
}

export type StatusGridProps = {
  heading?: string
  overallStatus?: 'operational' | 'degraded' | 'down'
  services: StatusGridService[]
}

const SERVICE_DOT: Record<StatusGridService['status'], string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  maintenance: 'bg-blue-500',
}

const OVERALL_LABEL: Record<NonNullable<StatusGridProps['overallStatus']>, string> = {
  operational: 'All systems operational',
  degraded: 'Partial degradation',
  down: 'Major outage',
}

const OVERALL_BG: Record<NonNullable<StatusGridProps['overallStatus']>, string> = {
  operational: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  degraded: 'bg-amber-100 text-amber-900 border-amber-300',
  down: 'bg-red-100 text-red-900 border-red-300',
}

export function StatusGrid({
  heading,
  overallStatus = 'operational',
  services,
}: StatusGridProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {heading ? (
          <h2 className="mb-4 text-2xl font-bold text-foreground">{heading}</h2>
        ) : null}
        <div
          className={`mb-6 rounded-lg border px-5 py-4 text-center font-semibold ${OVERALL_BG[overallStatus]}`}
        >
          {OVERALL_LABEL[overallStatus]}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${SERVICE_DOT[s.status]}`}
                />
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Checked {s.lastCheckedAt}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm text-muted-foreground">
                {s.uptime}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
