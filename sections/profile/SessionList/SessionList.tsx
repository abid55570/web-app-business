export type SessionItem = {
  id: string
  deviceLabel: string
  browser: string
  location: string
  ip: string
  lastActiveAt: string
  current?: boolean
  revokeAction?: string
}

export type SessionListProps = {
  sessions: SessionItem[]
  revokeAllAction?: string
}

export function SessionList({
  sessions,
  revokeAllAction,
}: SessionListProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Active sessions
        </h2>
        {revokeAllAction ? (
          <form action={revokeAllAction} method="POST">
            <button
              type="submit"
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Sign out all others
            </button>
          </form>
        ) : null}
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {s.deviceLabel}
                {s.current ? (
                  <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    this device
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.browser} · {s.location}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/70">
                {s.ip} · last active {s.lastActiveAt}
              </p>
            </div>
            {!s.current && s.revokeAction ? (
              <form action={s.revokeAction} method="POST">
                <button
                  type="submit"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Revoke
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
