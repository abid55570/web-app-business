export type CtaBookCardProps = {
  badge?: string
  title: string
  body: string
  features: string[]
  bookingHref: string
  bookingLabel?: string
  durationMinutes?: number
  hostName?: string
}

export function CtaBookCard({
  badge = 'Free consultation',
  title,
  body,
  features,
  bookingHref,
  bookingLabel = 'Book your slot',
  durationMinutes,
  hostName,
}: CtaBookCardProps) {
  return (
    <section className="px-6 py-16">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface-raised">
        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="p-7">
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {badge}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-base text-muted-foreground">{body}</p>
            <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
              {features.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-primary">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 border-t border-border bg-primary/5 p-7 text-center sm:border-l sm:border-t-0">
            {durationMinutes ? (
              <p className="text-3xl font-bold text-foreground">
                {durationMinutes}
                <span className="text-base font-normal text-muted-foreground">
                  {' '}min
                </span>
              </p>
            ) : null}
            {hostName ? (
              <p className="text-xs text-muted-foreground">
                with {hostName}
              </p>
            ) : null}
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {bookingLabel}
            </a>
          </div>
        </div>
      </article>
    </section>
  )
}
