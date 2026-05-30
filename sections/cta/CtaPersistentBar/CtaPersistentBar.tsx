export type CtaPersistentBarProps = {
  message: string
  ctaLabel: string
  ctaHref?: string
  dismissible?: boolean
}

export function CtaPersistentBar({
  message,
  ctaLabel,
  ctaHref = '#',
  dismissible = true,
}: CtaPersistentBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-2.5">
        <p className="text-sm">{message}</p>
        <div className="flex items-center gap-2">
          <a
            href={ctaHref}
            className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/30"
          >
            {ctaLabel}
          </a>
          {dismissible ? (
            <button
              type="button"
              aria-label="Dismiss"
              className="rounded-md p-1 text-lg leading-none hover:bg-white/20"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
