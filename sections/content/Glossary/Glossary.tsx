export type GlossaryEntry = {
  term: string
  definition: string
  related?: Array<{ label: string; href: string }>
}

export type GlossaryProps = {
  heading?: string
  entries: GlossaryEntry[]
}

export function Glossary({
  heading = 'Glossary',
  entries,
}: GlossaryProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="mb-4 text-2xl font-bold text-foreground">{heading}</h2>
      <dl className="divide-y divide-border">
        {entries.map((e, i) => (
          <div key={i} className="py-4">
            <dt className="font-mono text-sm font-bold text-primary">
              {e.term}
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              {e.definition}
            </dd>
            {e.related?.length ? (
              <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                {e.related.map((r, j) => (
                  <li key={j}>
                    <a
                      href={r.href}
                      className="text-primary hover:underline"
                    >
                      → {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}
