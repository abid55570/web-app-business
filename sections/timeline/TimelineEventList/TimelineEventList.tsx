export type TimelineEventListEvent = { time: string; title: string; description?: string; actor?: string }
export type TimelineEventListProps = { heading?: string; events: TimelineEventListEvent[] }
export function TimelineEventList({ heading, events }: TimelineEventListProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {heading ? <h2 className="mb-6 text-xl font-semibold text-foreground">{heading}</h2> : null}
        <ol className="space-y-4">
          {events.map((e, i) => (
            <li key={i} className="flex gap-4">
              <p className="w-20 flex-shrink-0 font-mono text-xs text-muted-foreground">{e.time}</p>
              <div className="flex-1 border-l border-border pl-4">
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
                {e.description ? <p className="text-xs text-muted-foreground">{e.description}</p> : null}
                {e.actor ? <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">by {e.actor}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
