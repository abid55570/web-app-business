export type FeatureBenefit = {
  icon?: string
  title: string
  body: string
}

export type FeatureBenefitsProps = {
  heading?: string
  intro?: string
  benefits: FeatureBenefit[]
}

export function FeatureBenefits({
  heading,
  intro,
  benefits,
}: FeatureBenefitsProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        {heading ? (
          <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
        ) : null}
        {intro ? (
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            {intro}
          </p>
        ) : null}
      </div>
      <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
        {benefits.map((b, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden
              className="grid h-10 w-10 flex-none place-items-center rounded-full bg-primary/10 text-lg text-primary"
            >
              {b.icon ?? '✓'}
            </span>
            <div>
              <p className="font-semibold text-foreground">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
