export type ApiKey = {
  id: string
  label: string
  prefix: string
  createdAt: string
  lastUsedAt?: string
}

export type ApiKeysListProps = {
  keys: ApiKey[]
  createAction: string
  revokeAction: string
}

export function ApiKeysList({ keys, createAction, revokeAction }: ApiKeysListProps) {
  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">API keys</h2>
        <form action={createAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            + New key
          </button>
        </form>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {keys.map((k) => (
          <li
            key={k.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium text-foreground">{k.label}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {k.prefix}••••••••
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {k.createdAt}
                {k.lastUsedAt ? ` · last used ${k.lastUsedAt}` : ' · never used'}
              </p>
            </div>
            <form action={`${revokeAction}/${k.id}`} method="POST">
              <button
                type="submit"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Revoke
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  )
}
