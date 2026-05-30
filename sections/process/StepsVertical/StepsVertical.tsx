export type StepsVerticalStep = {
  title: string
  description: string
  icon?: string
}

export type StepsVerticalProps = {
  heading?: string
  steps: StepsVerticalStep[]
}

export function StepsVertical({ heading, steps }: StepsVerticalProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading ? (
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            {heading}
          </h2>
        ) : null}
        <ol className="relative space-y-8 border-l-2 border-border pl-8">
          {steps.map((s, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className="absolute -left-[2.4rem] grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md"
              >
                {s.icon ?? i + 1}
              </span>
              <div className="rounded-xl border border-border bg-surface-raised p-5">
                <h3 className="text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
