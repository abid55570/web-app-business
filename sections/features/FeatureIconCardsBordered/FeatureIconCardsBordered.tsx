export type FeatureIconCardsBorderedFeature = {
  icon: string
  title: string
  description: string
}

export type FeatureIconCardsBorderedProps = {
  heading?: string
  features: FeatureIconCardsBorderedFeature[]
}

export function FeatureIconCardsBordered({
  heading,
  features,
}: FeatureIconCardsBorderedProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-border bg-surface-raised p-6 transition-colors hover:border-primary"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-xl">
              {f.icon}
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
