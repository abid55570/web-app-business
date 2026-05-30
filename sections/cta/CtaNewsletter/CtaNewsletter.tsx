export type CtaNewsletterProps = {
  headline: string
  body?: string
  action: string
  placeholder?: string
  ctaLabel?: string
  disclaimer?: string
}

export function CtaNewsletter({
  headline,
  body,
  action,
  placeholder = 'you@company.com',
  ctaLabel = 'Subscribe',
  disclaimer,
}: CtaNewsletterProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-raised p-10 text-center">
        <h2 className="text-3xl font-bold text-foreground">{headline}</h2>
        {body ? (
          <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
            {body}
          </p>
        ) : null}
        <form
          action={action}
          method="POST"
          className="mx-auto mt-6 flex max-w-md gap-2"
        >
          <label htmlFor="b-dash-newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="b-dash-newsletter-email"
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </button>
        </form>
        {disclaimer ? (
          <p className="mt-3 text-xs text-muted-foreground">{disclaimer}</p>
        ) : null}
      </div>
    </section>
  )
}
