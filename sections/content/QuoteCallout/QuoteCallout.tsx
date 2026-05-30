export type QuoteCalloutProps = {
  quote: string
  cite?: string
  variant?: 'default' | 'highlight'
}

export function QuoteCallout({
  quote,
  cite,
  variant = 'default',
}: QuoteCalloutProps) {
  const isHi = variant === 'highlight'
  return (
    <figure
      className={`my-8 rounded-lg border-l-4 px-6 py-5 ${
        isHi
          ? 'border-l-primary bg-primary/5'
          : 'border-l-border bg-surface-sunken'
      }`}
    >
      <blockquote className="text-lg italic leading-relaxed text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      {cite ? (
        <figcaption className="mt-3 text-sm font-semibold text-muted-foreground">
          — {cite}
        </figcaption>
      ) : null}
    </figure>
  )
}
