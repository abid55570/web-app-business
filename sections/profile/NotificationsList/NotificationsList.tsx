export type NotificationItem = {
  id: string
  title: string
  body?: string
  href?: string
  ago: string
  read?: boolean
  iconColor?: 'primary' | 'success' | 'warning' | 'error'
}

export type NotificationsListProps = {
  items: NotificationItem[]
  markAllReadAction?: string
}

const ICON_BG: Record<NonNullable<NotificationItem['iconColor']>, string> = {
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function NotificationsList({
  items,
  markAllReadAction,
}: NotificationsListProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        {markAllReadAction ? (
          <form action={markAllReadAction} method="POST">
            <button
              type="submit"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          </form>
        ) : null}
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {items.map((n) => (
          <li
            key={n.id}
            className={`flex gap-3 px-4 py-3 ${
              n.read ? 'opacity-70' : 'bg-primary/5'
            }`}
          >
            <span
              aria-hidden
              className={`mt-1 h-2 w-2 flex-none rounded-full ${
                ICON_BG[n.iconColor ?? 'primary']
              }`}
            />
            <div className="flex-1">
              {n.href ? (
                <a
                  href={n.href}
                  className="font-medium text-foreground hover:underline"
                >
                  {n.title}
                </a>
              ) : (
                <p className="font-medium text-foreground">{n.title}</p>
              )}
              {n.body ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">{n.ago}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
