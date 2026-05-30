export type CookieConsentProps = {
  message: string
  acceptLabel?: string
  rejectLabel?: string
  preferencesHref?: string
  acceptAction: string
  rejectAction: string
}

export function CookieConsent({
  message,
  acceptLabel = 'Accept all',
  rejectLabel = 'Reject',
  preferencesHref,
  acceptAction,
  rejectAction,
}: CookieConsentProps) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-5 shadow-2xl"
    >
      <p className="text-sm text-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {preferencesHref ? (
          <a
            href={preferencesHref}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Preferences
          </a>
        ) : null}
        <form action={rejectAction} method="POST">
          <button
            type="submit"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            {rejectLabel}
          </button>
        </form>
        <form action={acceptAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {acceptLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
