export type TourStep = {
  title: string
  body: string
}

export type WelcomeTourProps = {
  heading?: string
  body?: string
  steps: TourStep[]
  startLabel?: string
  startHref: string
  skipHref?: string
}

export function WelcomeTour({
  heading = "Welcome — here's the 30-second tour",
  body,
  steps,
  startLabel = 'Take the tour',
  startHref,
  skipHref,
}: WelcomeTourProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-raised p-8">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{heading}</h2>
        {body ? (
          <p className="mb-6 text-base text-muted-foreground">{body}</p>
        ) : null}
        <ol className="mb-8 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-background p-4"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Step {i + 1}
              </p>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={startHref}
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {startLabel} →
          </a>
          {skipHref ? (
            <a
              href={skipHref}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip — I'll explore on my own
            </a>
          ) : null}
        </div>
      </article>
    </section>
  )
}
