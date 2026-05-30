export type CtaStickyBottomProps = {
  message: string
  ctaLabel: string
  ctaHref: string
  dismissHref?: string
}

export function CtaStickyBottom({
  message,
  ctaLabel,
  ctaHref,
  dismissHref,
}: CtaStickyBottomProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-border bg-surface-raised/95 px-5 py-3 shadow-xl backdrop-blur">
      <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
      <a
        href={ctaHref}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {ctaLabel}
      </a>
      {dismissHref ? (
        <a
          href={dismissHref}
          aria-label="Dismiss"
          className="text-xl leading-none text-muted-foreground hover:text-foreground"
        >
          ×
        </a>
      ) : null}
    </div>
  )
}
