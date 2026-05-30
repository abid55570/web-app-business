export type CtaCalendlyBookProps = {
  headline: string
  body?: string
  ctaLabel?: string
  bookingUrl: string
  durationMinutes?: number
  hostName?: string
  hostAvatarUrl?: string
}

export function CtaCalendlyBook({
  headline,
  body,
  ctaLabel = 'Book a call',
  bookingUrl,
  durationMinutes,
  hostName,
  hostAvatarUrl,
}: CtaCalendlyBookProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-4xl items-center gap-8 rounded-2xl border border-border bg-surface-raised p-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
            {headline}
          </h2>
          {body ? (
            <p className="mt-2 text-base text-muted-foreground">{body}</p>
          ) : null}
          {(hostName || durationMinutes) ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              {hostAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={hostAvatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : null}
              {hostName ? (
                <span>
                  with <span className="font-semibold text-foreground">{hostName}</span>
                </span>
              ) : null}
              {durationMinutes ? (
                <span>· {durationMinutes} min</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
    </section>
  )
}
