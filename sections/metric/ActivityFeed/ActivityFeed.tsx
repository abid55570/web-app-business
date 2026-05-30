export type ActivityEvent = {
  actor: string
  action: string
  target?: string
  at: string
  icon?: string
}

export type ActivityFeedProps = {
  heading?: string
  events: ActivityEvent[]
}

export function ActivityFeed({
  heading = 'Recent activity',
  events,
}: ActivityFeedProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      <h2 className="mb-6 text-xl font-semibold text-foreground">{heading}</h2>
      <ol className="mx-auto max-w-3xl border-l border-border pl-6">
        {events.map((e, i) => (
          <li key={i} className="relative mb-6 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[31px] top-2 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background"
            >
              {e.icon ? (
                <span className="text-[8px]">{e.icon}</span>
              ) : null}
            </span>
            <p className="text-sm text-foreground">
              <strong>{e.actor}</strong> {e.action}
              {e.target ? (
                <span className="text-muted-foreground"> · {e.target}</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{e.at}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
