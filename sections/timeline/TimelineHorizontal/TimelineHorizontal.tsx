export type TimelineHorizontalItem = {
  date: string
  title: string
  body?: string
  icon?: string
}

export type TimelineHorizontalProps = {
  heading?: string
  items: TimelineHorizontalItem[]
}

export function TimelineHorizontal({ heading, items }: TimelineHorizontalProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="relative mx-auto flex max-w-5xl snap-x snap-mandatory gap-8 overflow-x-auto pb-6 [scrollbar-width:thin]">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-9 h-px bg-border"
        />
        {items.map((it, i) => (
          <li
            key={i}
            className="relative w-64 flex-none snap-start text-center"
          >
            <span className="relative z-10 mx-auto grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {it.icon ?? i + 1}
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {it.date}
            </p>
            <p className="mt-1 font-semibold text-foreground">{it.title}</p>
            {it.body ? (
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
