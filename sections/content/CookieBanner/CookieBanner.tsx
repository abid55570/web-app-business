export type CookieBannerProps = {
  message?: string
  privacyHref?: string
  acceptLabel?: string
  rejectLabel?: string
  manageHref?: string
}

export function CookieBanner({
  message = 'We use cookies for analytics and to improve your experience.',
  privacyHref = '/privacy',
  acceptLabel = 'Accept all',
  rejectLabel = 'Reject non-essential',
  manageHref,
}: CookieBannerProps) {
  return (
    <aside
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-raised/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          {message}{' '}
          <a href={privacyHref} className="underline">
            Read more
          </a>
          .
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {manageHref ? (
            <a
              href={manageHref}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            >
              Manage
            </a>
          ) : null}
          <form
            action="/api/consent"
            method="POST"
            className="contents"
          >
            <button
              type="submit"
              name="action"
              value="reject"
              className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent"
            >
              {rejectLabel}
            </button>
            <button
              type="submit"
              name="action"
              value="accept"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              {acceptLabel}
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
