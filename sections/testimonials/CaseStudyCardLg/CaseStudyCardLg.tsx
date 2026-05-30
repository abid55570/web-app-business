export type CaseStudyCardLgMetric = {
  value: string
  label: string
}

export type CaseStudyCardLgProps = {
  customerName: string
  customerLogoText: string
  industry?: string
  quote: string
  metrics: CaseStudyCardLgMetric[]
  href?: string
  ctaLabel?: string
  imageUrl?: string
}

export function CaseStudyCardLg({
  customerName,
  customerLogoText,
  industry,
  quote,
  metrics,
  href,
  ctaLabel = 'Read the full story',
  imageUrl,
}: CaseStudyCardLgProps) {
  return (
    <section className="px-6 py-16">
      <article className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl border border-border bg-surface-raised lg:grid-cols-[2fr_3fr]">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="aspect-square w-full object-cover lg:aspect-auto lg:h-full"
          />
        ) : (
          <div className="aspect-square w-full bg-gradient-to-br from-primary to-accent lg:aspect-auto lg:h-full" />
        )}
        <div className="p-8 lg:p-12">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xl font-black text-foreground opacity-70">
              {customerLogoText}
            </p>
            {industry ? (
              <span className="rounded-full bg-surface-overlay px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                {industry}
              </span>
            ) : null}
          </div>
          <blockquote className="mb-6 text-xl italic leading-snug text-foreground">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <p className="mb-6 text-xs text-muted-foreground">— {customerName}</p>
          <div className="mb-6 grid grid-cols-3 gap-4">
            {metrics.map((m, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-primary">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          {href ? (
            <a
              href={href}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {ctaLabel} →
            </a>
          ) : null}
        </div>
      </article>
    </section>
  )
}
