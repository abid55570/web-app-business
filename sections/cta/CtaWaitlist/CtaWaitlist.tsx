export type CtaWaitlistProps = {
  headline: string
  body?: string
  action: string
  placeholder?: string
  ctaLabel?: string
  socialProof?: string
}

export function CtaWaitlist({
  headline,
  body,
  action,
  placeholder = 'you@company.com',
  ctaLabel = 'Join the waitlist',
  socialProof,
}: CtaWaitlistProps) {
  return (
    <section className="px-6 py-20 text-center">
      <h2 className="mx-auto max-w-2xl text-3xl font-bold text-foreground lg:text-4xl">
        {headline}
      </h2>
      {body ? (
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          {body}
        </p>
      ) : null}
      <form
        action={action}
        method="POST"
        className="mx-auto mt-6 flex max-w-md gap-2"
      >
        <label htmlFor="b-dash-waitlist-email" className="sr-only">
          Email
        </label>
        <input
          id="b-dash-waitlist-email"
          type="email"
          name="email"
          required
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </button>
      </form>
      {socialProof ? (
        <p className="mt-4 text-sm text-muted-foreground">{socialProof}</p>
      ) : null}
    </section>
  )
}
