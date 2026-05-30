export type Footnote = {
  id: string
  body: string
}

export type FootnotesProps = {
  heading?: string
  footnotes: Footnote[]
}

export function Footnotes({
  heading = 'Notes',
  footnotes,
}: FootnotesProps) {
  return (
    <section
      aria-label={heading}
      className="mx-auto my-8 max-w-3xl border-t border-border pt-6"
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {heading}
      </h3>
      <ol className="space-y-2 text-sm text-muted-foreground">
        {footnotes.map((f, i) => (
          <li
            key={f.id}
            id={`fn-${f.id}`}
            className="grid grid-cols-[1.5rem_1fr] gap-1"
          >
            <span aria-hidden className="font-mono text-xs">
              [{i + 1}]
            </span>
            <span>
              {f.body}{' '}
              <a
                href={`#fnref-${f.id}`}
                aria-label="Back to reference"
                className="text-primary hover:underline"
              >
                ↩
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
