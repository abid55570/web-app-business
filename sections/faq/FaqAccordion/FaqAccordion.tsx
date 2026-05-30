/**
 * FaqAccordion — uses native <details>/<summary> for zero-JS toggle.
 * Each item is independently collapsible (not radio); lighter than a
 * managed React accordion + accessible by browser default.
 */
export type FaqItem = { question: string; answer: string }

export type FaqAccordionProps = {
  eyebrow?: string
  headline?: string
  items: FaqItem[]
}

export function FaqAccordion({
  eyebrow,
  headline = 'Frequently asked questions',
  items,
}: FaqAccordionProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mb-10 text-3xl font-bold text-foreground">
            {headline}
          </h2>
        </div>
        <ul className="space-y-3">
          {items.map((q, i) => (
            <li
              key={`${q.question}-${i}`}
              className="rounded-lg border border-border bg-card"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-base font-semibold text-foreground">
                  <span>{q.question}</span>
                  <span
                    aria-hidden
                    className="ml-4 inline-flex h-6 w-6 items-center justify-center text-lg text-muted-foreground transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">
                  {q.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
