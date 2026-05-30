export type StatsAuditMarkersMarker = {
  label: string
  date: string
  verifiedBy: string
  status: 'verified' | 'in-review' | 'expired'
}

export type StatsAuditMarkersProps = {
  heading?: string
  markers: StatsAuditMarkersMarker[]
}

const statusStyles: Record<string, string> = {
  verified: 'bg-success-bg text-success-fg border-success-border',
  'in-review': 'bg-info-bg text-info-fg border-info-border',
  expired: 'bg-error-bg text-error-fg border-error-border',
}

export function StatsAuditMarkers({
  heading,
  markers,
}: StatsAuditMarkersProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
        {markers.map((m, i) => (
          <li
            key={i}
            className={`rounded-lg border px-4 py-3 text-sm ${
              statusStyles[m.status]
            }`}
          >
            <p className="font-semibold">{m.label}</p>
            <p className="text-xs opacity-80">
              {m.date} · by {m.verifiedBy}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider">
              {m.status}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
