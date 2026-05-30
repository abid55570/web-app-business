export type CtaTwoOptionsOption = {
  title: string
  body: string
  ctaLabel: string
  ctaHref?: string
  highlighted?: boolean
}

export type CtaTwoOptionsProps = {
  heading?: string
  options: [CtaTwoOptionsOption, CtaTwoOptionsOption]
}

export function CtaTwoOptions({ heading, options }: CtaTwoOptionsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        {options.map((o, i) => (
          <article
            key={i}
            className={
              o.highlighted
                ? 'rounded-2xl border-2 border-primary bg-primary/5 p-8 text-center'
                : 'rounded-2xl border border-border bg-surface-raised p-8 text-center'
            }
          >
            <h3 className="mb-2 text-xl font-bold text-foreground">{o.title}</h3>
            <p className="mb-6 text-sm text-muted-foreground">{o.body}</p>
            <a
              href={o.ctaHref ?? '#'}
              className={
                o.highlighted
                  ? 'inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground'
                  : 'inline-block rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-overlay'
              }
            >
              {o.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
