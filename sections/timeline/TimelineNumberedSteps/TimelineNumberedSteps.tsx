export type TimelineNumberedStepsStep = {
  title: string
  body: string
}

export type TimelineNumberedStepsProps = {
  heading?: string
  steps: TimelineNumberedStepsStep[]
}

export function TimelineNumberedSteps({
  heading,
  steps,
}: TimelineNumberedStepsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto max-w-3xl space-y-6">
        {steps.map((s, i) => (
          <li key={i} className="relative flex gap-5">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground shadow">
              {i + 1}
            </span>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className="absolute left-6 top-12 h-[calc(100%+0.5rem)] w-px bg-border"
              />
            ) : null}
            <div className="flex-1 pt-1.5">
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
