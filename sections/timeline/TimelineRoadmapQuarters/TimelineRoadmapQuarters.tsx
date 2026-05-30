export type TimelineRoadmapQuartersQuarter = {
  label: string
  items: { title: string; status: 'shipped' | 'in-progress' | 'planned' }[]
}

export type TimelineRoadmapQuartersProps = {
  heading?: string
  quarters: TimelineRoadmapQuartersQuarter[]
}

const statusStyles: Record<string, string> = {
  shipped: 'bg-success-bg text-success-fg',
  'in-progress': 'bg-info-bg text-info-fg',
  planned: 'bg-surface-overlay text-muted-foreground',
}

export function TimelineRoadmapQuarters({
  heading,
  quarters,
}: TimelineRoadmapQuartersProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-4">
        {quarters.map((q, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface-raised p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
              {q.label}
            </h3>
            <ul className="space-y-2 text-sm">
              {q.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      statusStyles[it.status]
                    }`}
                  >
                    {it.status === 'in-progress' ? 'WIP' : it.status[0]}
                  </span>
                  <span className="flex-1 text-foreground">{it.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
