export type LoadingStateProps = {
  rows?: number
  showSpinner?: boolean
}

export function LoadingState({
  rows = 3,
  showSpinner = true,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 px-6 py-12"
    >
      {showSpinner ? (
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      ) : null}
      <span className="sr-only">Loading…</span>
      <div className="w-full max-w-2xl space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-overlay" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-overlay" />
          </div>
        ))}
      </div>
    </div>
  )
}
