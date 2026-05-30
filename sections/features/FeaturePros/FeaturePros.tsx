export type FeatureProsProps = {
  heading?: string
  pros: string[]
  cons: string[]
  prosLabel?: string
  consLabel?: string
}

export function FeaturePros({
  heading,
  pros,
  cons,
  prosLabel = 'Pros',
  consLabel = 'Cons',
}: FeatureProsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-4xl text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        <div className="rounded-xl border-l-4 border-l-emerald-500 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-sm font-bold uppercase tracking-wider">
            {prosLabel}
          </p>
          <ul className="mt-3 space-y-2">
            {pros.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span aria-hidden>✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border-l-4 border-l-red-500 bg-red-50 p-6 text-red-900">
          <p className="text-sm font-bold uppercase tracking-wider">
            {consLabel}
          </p>
          <ul className="mt-3 space-y-2">
            {cons.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span aria-hidden>✕</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
