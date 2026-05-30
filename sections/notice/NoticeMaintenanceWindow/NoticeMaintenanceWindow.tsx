export type NoticeMaintenanceWindowProps = {
  startsAt: string
  endsAt: string
  affectedServices?: string
  statusHref?: string
}

export function NoticeMaintenanceWindow({
  startsAt,
  endsAt,
  affectedServices,
  statusHref,
}: NoticeMaintenanceWindowProps) {
  return (
    <aside
      role="status"
      className="border-l-4 border-warning-border bg-warning-bg px-6 py-4 text-warning-fg"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            Scheduled maintenance window
          </p>
          <p className="text-xs">
            {startsAt} → {endsAt}
            {affectedServices ? ` · affects ${affectedServices}` : null}
          </p>
        </div>
        {statusHref ? (
          <a
            href={statusHref}
            className="rounded-md bg-warning-fg/10 px-3 py-1 text-xs font-semibold hover:bg-warning-fg/20"
          >
            View status
          </a>
        ) : null}
      </div>
    </aside>
  )
}
