export type SnippetGroup = {
  heading: string
  rows: Array<{ keys: string[]; description: string }>
}

export type SnippetsProps = {
  heading?: string
  groups: SnippetGroup[]
}

export function Snippets({
  heading = 'Keyboard shortcuts',
  groups,
}: SnippetsProps) {
  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{heading}</h2>
      {groups.map((g, i) => (
        <div key={i} className="mb-6 last:mb-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {g.heading}
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface-raised">
            {g.rows.map((r, j) => (
              <li
                key={j}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="text-foreground">{r.description}</span>
                <span className="flex gap-1">
                  {r.keys.map((k, kIndex) => (
                    <kbd
                      key={kIndex}
                      className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
