export type Milestone = {
  date: string
  title: string
  body?: string
  status?: 'done' | 'in-progress' | 'upcoming'
}

export type MilestoneListProps = {
  heading?: string
  milestones: Milestone[]
}

const STATUS_DOT: Record<NonNullable<Milestone['status']>, string> = {
  done: 'bg-emerald-500',
  'in-progress': 'bg-primary',
  upcoming: 'bg-surface-sunken border border-border',
}

const STATUS_LABEL: Record<NonNullable<Milestone['status']>, string> = {
  done: 'Done',
  'in-progress': 'In progress',
  upcoming: 'Upcoming',
}

export function MilestoneList({
  heading,
  milestones,
}: MilestoneListProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto max-w-3xl border-l border-border pl-8">
        {milestones.map((m, i) => {
          const status = m.status ?? 'upcoming'
          return (
            <li key={i} className="relative pb-8 last:pb-0">
              <span
                aria-hidden
                className={`absolute -left-[2.4rem] top-1 h-4 w-4 rounded-full ${STATUS_DOT[status]}`}
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {m.date} · {STATUS_LABEL[status]}
              </p>
              <p className="mt-1 font-semibold text-foreground">{m.title}</p>
              {m.body ? (
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
              ) : null}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
