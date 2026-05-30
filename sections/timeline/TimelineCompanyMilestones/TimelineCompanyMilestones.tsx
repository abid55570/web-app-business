export type TimelineCompanyMilestone = {
  year: string
  title: string
  body?: string
}

export type TimelineCompanyMilestonesProps = {
  heading?: string
  milestones: TimelineCompanyMilestone[]
}

export function TimelineCompanyMilestones({
  heading,
  milestones,
}: TimelineCompanyMilestonesProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto max-w-4xl space-y-8">
        {milestones.map((m, i) => (
          <li key={i} className="grid gap-4 sm:grid-cols-[100px_1fr]">
            <div className="text-right">
              <span className="text-3xl font-black text-primary">{m.year}</span>
            </div>
            <div className="border-l-2 border-border pl-6">
              <h3 className="text-lg font-semibold text-foreground">
                {m.title}
              </h3>
              {m.body ? (
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
