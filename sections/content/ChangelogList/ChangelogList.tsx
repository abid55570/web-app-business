export type ChangelogItem = {
  kind: 'added' | 'changed' | 'fixed' | 'removed'
  text: string
}

export type ChangelogRelease = {
  version: string
  releasedAt: string
  summary?: string
  items: ChangelogItem[]
}

export type ChangelogListProps = {
  heading?: string
  releases: ChangelogRelease[]
}

const KIND_CLASS: Record<ChangelogItem['kind'], string> = {
  added: 'bg-emerald-100 text-emerald-800',
  changed: 'bg-amber-100 text-amber-800',
  fixed: 'bg-blue-100 text-blue-800',
  removed: 'bg-red-100 text-red-800',
}

export function ChangelogList({
  heading = 'Changelog',
  releases,
}: ChangelogListProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <h2 className="mb-10 text-3xl font-bold text-foreground">{heading}</h2>
      <ol className="mx-auto max-w-3xl space-y-12">
        {releases.map((r, i) => (
          <li key={i}>
            <header className="mb-3">
              <p className="text-2xl font-bold text-foreground">
                v{r.version}
              </p>
              <p className="text-xs text-muted-foreground">
                Released {r.releasedAt}
              </p>
            </header>
            {r.summary ? (
              <p className="mb-4 text-sm text-muted-foreground">{r.summary}</p>
            ) : null}
            <ul className="space-y-2">
              {r.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KIND_CLASS[it.kind]}`}
                  >
                    {it.kind}
                  </span>
                  <span className="text-foreground">{it.text}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
