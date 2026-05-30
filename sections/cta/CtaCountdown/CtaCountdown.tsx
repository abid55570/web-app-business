export type CtaCountdownProps = {
  headline: string
  body?: string
  endsAtIso: string
  daysLeft: number
  hoursLeft: number
  minutesLeft: number
  ctaLabel: string
  ctaHref: string
}

export function CtaCountdown({
  headline,
  body,
  endsAtIso,
  daysLeft,
  hoursLeft,
  minutesLeft,
  ctaLabel,
  ctaHref,
}: CtaCountdownProps) {
  return (
    <section className="px-6 py-16">
      <article className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary to-accent p-8 text-center text-primary-foreground shadow-xl">
        <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
          {headline}
        </h2>
        {body ? (
          <p className="mx-auto mt-3 max-w-xl text-base opacity-90">{body}</p>
        ) : null}
        <ul className="mt-6 flex justify-center gap-3">
          {[
            { label: 'days', n: daysLeft },
            { label: 'hours', n: hoursLeft },
            { label: 'min', n: minutesLeft },
          ].map((u) => (
            <li
              key={u.label}
              className="grid h-20 w-20 place-items-center rounded-xl bg-surface-raised/95 text-foreground"
            >
              <p className="text-3xl font-bold">
                {String(u.n).padStart(2, '0')}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {u.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs opacity-80">
          <time dateTime={endsAtIso}>Ends {endsAtIso}</time>
        </p>
        <a
          href={ctaHref}
          className="mt-6 inline-flex items-center rounded-full bg-surface-raised px-8 py-3 text-base font-semibold text-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </article>
    </section>
  )
}
