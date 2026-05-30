export type CookieTopBarProps = {
  message: string
  acceptAction: string
  rejectAction: string
  preferencesHref?: string
}

export function CookieTopBar({
  message,
  acceptAction,
  rejectAction,
  preferencesHref,
}: CookieTopBarProps) {
  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="w-full border-b border-border bg-surface-sunken px-6 py-2 text-xs"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <p className="flex-1 text-muted-foreground">{message}</p>
        {preferencesHref ? (
          <a
            href={preferencesHref}
            className="font-semibold text-muted-foreground hover:text-foreground"
          >
            Preferences
          </a>
        ) : null}
        <form action={rejectAction} method="POST">
          <button
            type="submit"
            className="rounded-md border border-border bg-background px-3 py-1 font-semibold text-foreground hover:bg-accent"
          >
            Reject
          </button>
        </form>
        <form action={acceptAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1 font-semibold text-primary-foreground hover:opacity-90"
          >
            Accept
          </button>
        </form>
      </div>
    </div>
  )
}
