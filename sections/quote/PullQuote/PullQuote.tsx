/**
 * PullQuote — large centered blockquote with optional attribution + avatar.
 */
export type PullQuoteProps = {
  quote: string
  attribution?: string
  avatarUrl?: string
}

export function PullQuote({ quote, attribution, avatarUrl }: PullQuoteProps) {
  return (
    <section className="px-6 py-20 lg:px-12 lg:py-28">
      <figure className="mx-auto max-w-3xl text-center">
        <blockquote className="text-2xl font-medium leading-snug text-foreground lg:text-3xl">
          <span aria-hidden="true" className="text-primary">“</span>
          {quote}
          <span aria-hidden="true" className="text-primary">”</span>
        </blockquote>
        {attribution || avatarUrl ? (
          <figcaption className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
              />
            ) : null}
            {attribution ? <span>— {attribution}</span> : null}
          </figcaption>
        ) : null}
      </figure>
    </section>
  )
}
