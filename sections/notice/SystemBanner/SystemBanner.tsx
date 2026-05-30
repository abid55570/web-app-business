export type SystemBannerProps = {
  variant?: 'info' | 'warning' | 'danger'
  message: string
  detailsHref?: string
  dismissAction?: string
}

const PALETTE: Record<NonNullable<SystemBannerProps['variant']>, string> = {
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-black',
  danger: 'bg-red-600 text-white',
}

export function SystemBanner({
  variant = 'info',
  message,
  detailsHref,
  dismissAction,
}: SystemBannerProps) {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 px-6 py-2 text-sm font-medium ${PALETTE[variant]}`}
    >
      <p className="flex-1">{message}</p>
      <div className="flex items-center gap-2">
        {detailsHref ? (
          <a href={detailsHref} className="text-xs font-semibold underline">
            Details
          </a>
        ) : null}
        {dismissAction ? (
          <form action={dismissAction} method="POST">
            <button
              type="submit"
              aria-label="Dismiss"
              className="text-lg leading-none opacity-80 hover:opacity-100"
            >
              ×
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
