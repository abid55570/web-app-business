export type FaqRichAnswersItem = {
  q: string
  a: string
  codeExample?: string
  linkLabel?: string
  linkHref?: string
}

export type FaqRichAnswersProps = {
  heading?: string
  items: FaqRichAnswersItem[]
}

export function FaqRichAnswers({ heading, items }: FaqRichAnswersProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading ? (
          <h2 className="mb-8 text-3xl font-bold text-foreground">{heading}</h2>
        ) : null}
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li
              key={i}
              className="rounded-xl border border-border bg-surface-raised"
            >
              <details>
                <summary className="cursor-pointer list-none px-5 py-4 text-base font-semibold text-foreground">
                  {it.q}
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm">
                  <p className="text-muted-foreground">{it.a}</p>
                  {it.codeExample ? (
                    <pre className="mt-3 overflow-x-auto rounded-md bg-surface-overlay p-3 text-xs font-mono text-foreground">
                      {it.codeExample}
                    </pre>
                  ) : null}
                  {it.linkLabel ? (
                    <a
                      href={it.linkHref ?? '#'}
                      className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      {it.linkLabel} →
                    </a>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
