export type QuoteLogoStripProps = {
  quote: string
  authorName: string
  authorRole?: string
  customerLogoText: string
  ctaLabel?: string
  ctaHref?: string
}

export function QuoteLogoStrip({
  quote,
  authorName,
  authorRole,
  customerLogoText,
  ctaLabel,
  ctaHref = '#',
}: QuoteLogoStripProps) {
  return (
    <section className="border-y border-border bg-surface-raised px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
        <span className="text-2xl font-black text-muted-foreground opacity-70">
          {customerLogoText}
        </span>
        <blockquote className="flex-1 text-lg italic text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="flex-shrink-0">
          <p className="text-sm font-semibold text-foreground">{authorName}</p>
          {authorRole ? (
            <p className="text-xs text-muted-foreground">{authorRole}</p>
          ) : null}
          {ctaLabel ? (
            <a
              href={ctaHref}
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              {ctaLabel} →
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
