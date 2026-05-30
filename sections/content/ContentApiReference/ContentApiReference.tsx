export type ContentApiReferenceParam = {
  name: string
  type: string
  required?: boolean
  description: string
}

export type ContentApiReferenceProps = {
  method: string
  path: string
  description: string
  params?: ContentApiReferenceParam[]
  exampleResponse?: string
}

export function ContentApiReference({
  method,
  path,
  description,
  params = [],
  exampleResponse,
}: ContentApiReferenceProps) {
  const methodColor =
    method === 'GET' ? 'bg-info-bg text-info-fg'
    : method === 'POST' ? 'bg-success-bg text-success-fg'
    : method === 'DELETE' ? 'bg-error-bg text-error-fg'
    : 'bg-warning-bg text-warning-fg'
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
          <span
            className={`rounded px-2.5 py-1 font-mono text-xs font-bold ${methodColor}`}
          >
            {method}
          </span>
          <code className="font-mono text-sm text-foreground">{path}</code>
        </div>
        <p className="mb-6 text-base text-muted-foreground">{description}</p>
        {params.length ? (
          <>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Parameters
            </h3>
            <ul className="mb-6 divide-y divide-border rounded-lg border border-border">
              {params.map((p, i) => (
                <li key={i} className="px-4 py-3">
                  <p className="text-sm">
                    <code className="font-mono text-primary">{p.name}</code>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {p.type}
                    </span>
                    {p.required ? (
                      <span className="ml-2 text-[10px] font-bold uppercase text-error-fg">
                        required
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {exampleResponse ? (
          <>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Example response
            </h3>
            <pre className="overflow-x-auto rounded-lg bg-foreground p-4 text-xs font-mono text-surface-base">
              {exampleResponse}
            </pre>
          </>
        ) : null}
      </div>
    </section>
  )
}
