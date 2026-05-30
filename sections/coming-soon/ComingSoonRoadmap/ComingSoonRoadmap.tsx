export type ComingSoonRoadmapMilestone = {
  label: string
  eta: string
  status: 'shipped' | 'next' | 'later'
}

export type ComingSoonRoadmapProps = {
  heading?: string
  intro?: string
  milestones: ComingSoonRoadmapMilestone[]
}

const statusStyles: Record<string, string> = {
  shipped: 'bg-success-bg text-success-fg',
  next: 'bg-info-bg text-info-fg',
  later: 'bg-surface-overlay text-muted-foreground',
}

export function ComingSoonRoadmap({
  heading = "What's coming",
  intro,
  milestones,
}: ComingSoonRoadmapProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-3xl font-bold text-foreground">{heading}</h2>
        {intro ? (
          <p className="mb-8 text-base text-muted-foreground">{intro}</p>
        ) : null}
        <ul className="space-y-3">
          {milestones.map((m, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {m.label}
                </p>
                <p className="text-xs text-muted-foreground">{m.eta}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  statusStyles[m.status]
                }`}
              >
                {m.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
