export type Error403LockedProps = {
  heading?: string
  body?: string
  requestAccessLabel?: string
  requestAccessHref?: string
  loginLabel?: string
  loginHref?: string
}

export function Error403Locked({
  heading = "You don't have access",
  body = 'This page is restricted. Ask the workspace owner to grant access or sign in with a different account.',
  requestAccessLabel = 'Request access',
  requestAccessHref = '#',
  loginLabel = 'Switch account',
  loginHref = '/login',
}: Error403LockedProps) {
  return (
    <section className="grid min-h-[60vh] place-items-center px-6 py-16">
      <div className="text-center">
        <p className="mb-4 text-[8rem] font-black leading-none text-warning-fg opacity-20">
          403
        </p>
        <span
          aria-hidden
          className="mb-4 inline-grid h-12 w-12 place-items-center rounded-full bg-warning-bg text-warning-fg"
        >
          🔒
        </span>
        <h1 className="mb-3 text-3xl font-bold text-foreground">{heading}</h1>
        <p className="mx-auto mb-8 max-w-md text-base text-muted-foreground">
          {body}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={requestAccessHref}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {requestAccessLabel}
          </a>
          <a
            href={loginHref}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-overlay"
          >
            {loginLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
