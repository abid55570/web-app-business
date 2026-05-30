export type ProfileSessionsActiveSession = {
  id: string
  device: string
  location: string
  lastActive: string
  current?: boolean
}

export type ProfileSessionsActiveProps = {
  heading?: string
  sessions: ProfileSessionsActiveSession[]
  signOutOthersLabel?: string
}

export function ProfileSessionsActive({
  heading = 'Active sessions',
  sessions,
  signOutOthersLabel = 'Sign out all other sessions',
}: ProfileSessionsActiveProps) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
          <button
            type="button"
            className="rounded-md border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-overlay"
          >
            {signOutOthersLabel}
          </button>
        </div>
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised p-4"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {s.device}
                  {s.current ? (
                    <span className="rounded bg-success-bg px-1.5 py-0.5 text-[9px] font-bold uppercase text-success-fg">
                      This device
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.location} · last active {s.lastActive}
                </p>
              </div>
              {!s.current ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-error-fg hover:underline"
                >
                  Sign out
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
