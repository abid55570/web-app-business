export type MaintenanceBannerProps = {
  windowStart: string
  windowEnd: string
  message: string
  statusPageUrl?: string
}

export function MaintenanceBanner({
  windowStart,
  windowEnd,
  message,
  statusPageUrl,
}: MaintenanceBannerProps) {
  return (
    <aside
      role="status"
      className="border-l-4 border-l-amber-500 bg-amber-50 px-5 py-4 text-amber-900"
    >
      <p className="text-xs font-bold uppercase tracking-wider">
        Scheduled maintenance · {windowStart} → {windowEnd}
      </p>
      <p className="mt-1 text-sm">{message}</p>
      {statusPageUrl ? (
        <a
          href={statusPageUrl}
          className="mt-2 inline-block text-xs font-semibold underline"
        >
          View status page →
        </a>
      ) : null}
    </aside>
  )
}
