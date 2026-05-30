export type BlogCalendarPost = {
  day: number
  title: string
  href: string
  author?: string
}

export type BlogCalendarProps = {
  monthLabel: string
  daysInMonth: number
  posts: BlogCalendarPost[]
}

export function BlogCalendar({
  monthLabel,
  daysInMonth,
  posts,
}: BlogCalendarProps) {
  const byDay = new Map<number, BlogCalendarPost[]>()
  for (const p of posts) {
    const arr = byDay.get(p.day) ?? []
    arr.push(p)
    byDay.set(p.day, arr)
  }
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  return (
    <section className="px-6 py-10">
      <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">
        {monthLabel}
      </h2>
      <ol className="mx-auto grid max-w-3xl grid-cols-7 gap-1">
        {days.map((d) => {
          const dayPosts = byDay.get(d) ?? []
          return (
            <li
              key={d}
              className={`min-h-[5rem] rounded-md border border-border p-1.5 text-left ${
                dayPosts.length
                  ? 'bg-primary/5'
                  : 'bg-surface-raised text-muted-foreground'
              }`}
            >
              <p className="text-[10px] font-mono font-bold text-muted-foreground">
                {d}
              </p>
              <ul className="mt-1 space-y-0.5">
                {dayPosts.map((p, i) => (
                  <li key={i}>
                    <a
                      href={p.href}
                      className="block truncate text-[11px] font-medium text-foreground hover:underline"
                      title={p.title}
                    >
                      {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
