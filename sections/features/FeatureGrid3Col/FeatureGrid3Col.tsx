/**
 * FeatureGrid3Col — section headline above a responsive 3-column grid
 * of {icon, title, body} cards.
 *
 * `features` is intentionally typed as plain objects (not React nodes)
 * so Studio can edit them via the array prop editor.
 */
export type Feature = {
  icon?: string
  title: string
  body: string
}

export type FeatureGrid3ColProps = {
  eyebrow?: string
  headline?: string
  body?: string
  features: Feature[]
}

export function FeatureGrid3Col({
  eyebrow,
  headline,
  body,
  features,
}: FeatureGrid3ColProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        {headline ? (
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            {headline}
          </h2>
        ) : null}
        {body ? (
          <p className="text-lg text-muted-foreground">{body}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <article
            key={`${f.title}-${i}`}
            className="rounded-lg border border-border bg-card p-6"
          >
            {f.icon ? (
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <span aria-hidden>{f.icon}</span>
              </div>
            ) : null}
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
