export type SecurityActivityEvent = {
  id: string
  kind: 'login' | 'failed' | 'password' | 'mfa' | 'session'
  device: string
  location: string
  ip: string
  ago: string
}

export type SecurityActivityProps = {
  events: SecurityActivityEvent[]
}

const KIND_LABEL: Record<SecurityActivityEvent['kind'], string> = {
  login: 'Sign in',
  failed: 'Failed attempt',
  password: 'Password changed',
  mfa: '2FA verified',
  session: 'Session revoked',
}

const KIND_COLOR: Record<SecurityActivityEvent['kind'], string> = {
  login: 'bg-emerald-500',
  failed: 'bg-red-500',
  password: 'bg-blue-500',
  mfa: 'bg-purple-500',
  session: 'bg-amber-500',
}

export function SecurityActivity({ events }: SecurityActivityProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Security activity
      </h2>
      <ol className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden
              className={`mt-1.5 h-2 w-2 flex-none rounded-full ${KIND_COLOR[e.kind]}`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {KIND_LABEL[e.kind]}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.device} · {e.location}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/70">
                {e.ip}
              </p>
            </div>
            <p className="flex-none text-xs text-muted-foreground">{e.ago}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
