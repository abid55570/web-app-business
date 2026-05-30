export type ContentStepsNumberedProps = {
  heading?: string
  steps: { title: string; body: string }[]
}
export function ContentStepsNumbered({ heading, steps }: ContentStepsNumberedProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {heading ? <h2 className="mb-6 text-2xl font-bold text-foreground">{heading}</h2> : null}
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-foreground font-mono text-sm font-bold text-surface-base">{i + 1}</span>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
