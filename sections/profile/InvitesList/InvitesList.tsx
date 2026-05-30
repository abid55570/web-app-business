export type Invite = {
  id: string
  workspaceName: string
  inviterName: string
  role: string
  sentAt: string
  acceptAction: string
  declineAction: string
}

export type InvitesListProps = {
  invites: Invite[]
  emptyLabel?: string
}

export function InvitesList({
  invites,
  emptyLabel = 'No pending invites',
}: InvitesListProps) {
  if (invites.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-surface-sunken p-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </section>
    )
  }
  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Pending invites
      </h2>
      <ul className="space-y-3">
        {invites.map((i) => (
          <li
            key={i.id}
            className="rounded-lg border border-border bg-surface-raised p-4"
          >
            <p className="font-semibold text-foreground">
              {i.workspaceName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {i.inviterName} invited you · role:{' '}
              <span className="font-medium text-foreground">{i.role}</span>{' '}
              · {i.sentAt}
            </p>
            <div className="mt-3 flex gap-2">
              <form action={i.acceptAction} method="POST" className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Accept
                </button>
              </form>
              <form action={i.declineAction} method="POST">
                <button
                  type="submit"
                  className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Decline
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
