export type ContentLegalSectionClause = {
  id: string
  title: string
  paragraphs: string[]
}

export type ContentLegalSectionProps = {
  documentTitle: string
  effectiveDate: string
  clauses: ContentLegalSectionClause[]
}

export function ContentLegalSection({
  documentTitle,
  effectiveDate,
  clauses,
}: ContentLegalSectionProps) {
  return (
    <section className="px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-bold text-foreground">
            {documentTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Effective {effectiveDate}
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-foreground">
          {clauses.map((c, i) => (
            <section key={c.id} id={c.id}>
              <h2 className="mb-3 text-xl font-semibold">
                <span className="mr-2 text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                {c.title}
              </h2>
              {c.paragraphs.map((p, j) => (
                <p key={j} className="mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </section>
  )
}
