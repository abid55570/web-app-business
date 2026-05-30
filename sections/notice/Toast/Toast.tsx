export type ToastProps = {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title: string
  body?: string
  actionLabel?: string
  actionHref?: string
}

const PALETTE: Record<NonNullable<ToastProps['variant']>, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-red-300 bg-red-50 text-red-900',
}

export function Toast({
  variant = 'info',
  title,
  body,
  actionLabel,
  actionHref,
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${PALETTE[variant]}`}
    >
      <div className="flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {body ? <p className="mt-0.5 opacity-80">{body}</p> : null}
        {actionLabel && actionHref ? (
          <a
            href={actionHref}
            className="mt-2 inline-block text-xs font-semibold underline"
          >
            {actionLabel}
          </a>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="text-xl leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}
