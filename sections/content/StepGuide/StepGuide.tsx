export type StepGuideStep = {
  title: string
  body: string
  code?: string
}

export type StepGuideProps = {
  heading?: string
  steps: StepGuideStep[]
}

export function StepGuide({ heading, steps }: StepGuideProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      {heading ? (
        <h2 className="mb-6 text-2xl font-bold text-foreground">{heading}</h2>
      ) : null}
      <ol className="space-y-6">
        {steps.map((s, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-surface-raised p-5"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid h-7 w-7 flex-none place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                {s.code ? (
                  <pre className="mt-3 overflow-x-auto rounded-md bg-surface-sunken px-3 py-2 text-xs">
                    <code className="font-mono text-foreground">{s.code}</code>
                  </pre>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
