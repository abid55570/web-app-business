export type FeatureMetric = {
  value: string
  label: string
  hint?: string
}

export type FeatureMetricsStripProps = {
  heading?: string
  metrics: FeatureMetric[]
}

export function FeatureMetricsStrip({
  heading,
  metrics,
}: FeatureMetricsStripProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-4xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <dl className="mx-auto grid max-w-5xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-raised sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="px-6 py-5 text-center">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {m.label}
            </dt>
            <dd className="mt-2 text-3xl font-bold text-foreground lg:text-4xl">
              {m.value}
            </dd>
            {m.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}
