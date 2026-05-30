/**
 * TimelineVertical — left rail with bullet markers; events stacked top→bottom.
 */
export type TimelineEvent = {
  date: string
  title: string
  body?: string
}

export type TimelineVerticalProps = {
  heading?: string
  events: TimelineEvent[]
}

export function TimelineVertical({ heading, events }: TimelineVerticalProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      {heading ? (
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto max-w-3xl border-l border-border pl-6">
        {events.map((e, i) => (
          <li key={i} className="relative mb-10 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
            />
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {e.date}
            </p>
            <p className="text-lg font-semibold text-foreground">{e.title}</p>
            {e.body ? (
              <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
