export type ContentChangelogYearEntry = {
  date: string
  tag?: 'feature' | 'fix' | 'breaking' | 'note'
  title: string
  body?: string
}

export type ContentChangelogYearProps = {
  year: string
  entries: ContentChangelogYearEntry[]
}

const tagStyles: Record<string, string> = {
  feature: 'bg-success-bg text-success-fg',
  fix: 'bg-info-bg text-info-fg',
  breaking: 'bg-error-bg text-error-fg',
  note: 'bg-warning-bg text-warning-fg',
}

export function ContentChangelogYear({
  year,
  entries,
}: ContentChangelogYearProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-5xl font-black text-foreground opacity-20">
          {year}
        </h2>
        <ol className="space-y-6 border-l-2 border-border pl-6">
          {entries.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-surface-base" />
              <p className="text-xs font-mono text-muted-foreground">
                {e.date}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {e.tag ? (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      tagStyles[e.tag] ?? 'bg-surface-overlay'
                    }`}
                  >
                    {e.tag}
                  </span>
                ) : null}
                <h3 className="text-base font-semibold text-foreground">
                  {e.title}
                </h3>
              </div>
              {e.body ? (
                <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
