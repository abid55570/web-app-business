export type QueuedToastItem = {
  id: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  title: string
  body?: string
}

export type QueuedToastProps = {
  toasts: QueuedToastItem[]
}

const PALETTE: Record<NonNullable<QueuedToastItem['variant']>, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-red-300 bg-red-50 text-red-900',
}

export function QueuedToast({ toasts }: QueuedToastProps) {
  return (
    <ol
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <li
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            PALETTE[t.variant ?? 'info']
          }`}
        >
          <div className="flex-1 text-sm">
            <p className="font-semibold">{t.title}</p>
            {t.body ? <p className="mt-0.5 opacity-80">{t.body}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </li>
      ))}
    </ol>
  )
}
