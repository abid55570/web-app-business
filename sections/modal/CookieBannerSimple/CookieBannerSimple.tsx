export type CookieBannerSimpleProps = {
  message?: string
  acceptLabel?: string
  rejectLabel?: string
  manageHref?: string
}

export function CookieBannerSimple({
  message = 'We use cookies to keep the site running and to understand traffic. Read more.',
  acceptLabel = 'Accept all',
  rejectLabel = 'Reject non-essential',
  manageHref,
}: CookieBannerSimpleProps) {
  return (
    <aside
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-border bg-surface-raised p-4 shadow-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex-1 text-sm text-foreground">
          {message}
          {manageHref ? (
            <>
              {' '}
              <a
                href={manageHref}
                className="font-semibold text-primary underline"
              >
                Manage
              </a>
            </>
          ) : null}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-border bg-surface-base px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-overlay"
          >
            {rejectLabel}
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </aside>
  )
}
