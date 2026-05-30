/**
 * StepsHorizontal — numbered cards in a row at md+, stacked below.
 */
export type ProcessStep = {
  title: string
  body?: string
}

export type StepsHorizontalProps = {
  heading?: string
  steps: ProcessStep[]
}

export function StepsHorizontal({
  heading = 'How it works',
  steps,
}: StepsHorizontalProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <ol className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
        {steps.map((s, i) => (
          <li key={i} className="text-center">
            <p className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </p>
            <p className="mb-2 text-base font-semibold text-foreground">
              {s.title}
            </p>
            {s.body ? (
              <p className="text-sm text-muted-foreground">{s.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
