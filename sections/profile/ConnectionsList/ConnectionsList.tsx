export type Connection = {
  id: string
  provider: string
  account?: string
  connected: boolean
  connectHref: string
  disconnectAction?: string
}

export type ConnectionsListProps = {
  heading?: string
  connections: Connection[]
}

export function ConnectionsList({
  heading = 'Connected accounts',
  connections,
}: ConnectionsListProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{heading}</h2>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {connections.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium text-foreground">{c.provider}</p>
              {c.account ? (
                <p className="font-mono text-xs text-muted-foreground">
                  {c.account}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not connected</p>
              )}
            </div>
            {c.connected && c.disconnectAction ? (
              <form action={c.disconnectAction} method="POST">
                <button
                  type="submit"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Disconnect
                </button>
              </form>
            ) : (
              <a
                href={c.connectHref}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Connect
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
