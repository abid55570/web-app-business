export type BlogArchiveYear = {
  year: number
  months: Array<{ label: string; href: string; count: number }>
}

export type BlogArchiveProps = {
  heading?: string
  years: BlogArchiveYear[]
}

export function BlogArchive({
  heading = 'Archive',
  years,
}: BlogArchiveProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="mb-5 text-xl font-semibold text-foreground">{heading}</h2>
      <ol className="space-y-6">
        {years.map((y) => (
          <li key={y.year}>
            <p className="border-b border-border pb-1 font-mono text-sm font-bold text-foreground">
              {y.year}
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              {y.months.map((m, i) => (
                <li key={i}>
                  <a
                    href={m.href}
                    className="flex justify-between text-muted-foreground hover:text-foreground"
                  >
                    <span>{m.label}</span>
                    <span className="text-xs opacity-70">{m.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
