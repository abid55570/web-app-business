/**
 * CtaCentered — full-width band with centered headline + button.
 * Sits well between content sections + the footer.
 */
export type CtaCenteredProps = {
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function CtaCentered({
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
}: CtaCenteredProps) {
  return (
    <section className="px-6 py-20 text-center lg:px-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
          {headline}
        </h2>
        {body ? (
          <p className="mt-4 text-lg text-muted-foreground">{body}</p>
        ) : null}
        <a
          href={ctaHref}
          className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  )
}
