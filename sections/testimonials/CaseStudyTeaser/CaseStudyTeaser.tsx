export type CaseStudyTeaserProps = {
  customerName: string
  customerLogoUrl: string
  headline: string
  metric: { value: string; label: string }
  href: string
  imageUrl?: string
}

export function CaseStudyTeaser({
  customerName,
  customerLogoUrl,
  headline,
  metric,
  href,
  imageUrl,
}: CaseStudyTeaserProps) {
  return (
    <article className="mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-2xl border border-border bg-surface-raised sm:grid-cols-[2fr_1fr]">
      <div className="p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customerLogoUrl}
          alt={customerName}
          className="h-8 w-auto opacity-80"
        />
        <h3 className="mt-4 text-2xl font-bold leading-snug text-foreground">
          {headline}
        </h3>
        <p className="mt-4 text-4xl font-bold text-primary">
          {metric.value}
        </p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <a
          href={href}
          className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          Read case study →
        </a>
      </div>
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : null}
    </article>
  )
}
