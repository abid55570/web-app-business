export type CtaBookDemoProps = {
  heading: string
  body?: string
  bookHref: string
  bookLabel?: string
  perks?: string[]
  contactEmail?: string
}

export function CtaBookDemo({
  heading,
  body,
  bookHref,
  bookLabel = 'Book a 30-min demo',
  perks = [],
  contactEmail,
}: CtaBookDemoProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface-raised p-10 shadow-lg lg:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {heading}
            </h2>
            {body ? (
              <p className="mb-5 text-base text-muted-foreground">{body}</p>
            ) : null}
            {perks.length ? (
              <ul className="mb-5 grid gap-1.5 text-sm text-foreground sm:grid-cols-2">
                {perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {contactEmail ? (
              <p className="text-xs text-muted-foreground">
                or email{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary hover:underline"
                >
                  {contactEmail}
                </a>
              </p>
            ) : null}
          </div>
          <a
            href={bookHref}
            className="block rounded-xl bg-primary px-6 py-4 text-center text-base font-semibold text-primary-foreground"
          >
            {bookLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
