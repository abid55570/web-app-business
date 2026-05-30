export type FeatureCardStackItem = {
  title: string
  body: string
  icon?: string
  accent?: 'primary' | 'success' | 'warning' | 'info'
}

export type FeatureCardStackProps = {
  heading?: string
  items: FeatureCardStackItem[]
}

const ACCENT: Record<NonNullable<FeatureCardStackItem['accent']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-black',
  info: 'bg-blue-500 text-white',
}

export function FeatureCardStack({ heading, items }: FeatureCardStackProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {items.map((it, i) => (
          <article
            key={i}
            style={{ marginLeft: `${i * 14}px` }}
            className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className={`grid h-9 w-9 flex-none place-items-center rounded-lg text-lg ${
                  ACCENT[it.accent ?? 'primary']
                }`}
              >
                {it.icon ?? '✦'}
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{it.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
