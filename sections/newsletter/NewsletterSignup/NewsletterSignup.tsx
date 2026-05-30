/**
 * NewsletterSignup — single-input centered card. Zero JS; POST to `action`.
 */
export type NewsletterSignupProps = {
  heading?: string
  body?: string
  action: string
  buttonLabel?: string
  legalLine?: string
}

export function NewsletterSignup({
  heading = 'Stay in the loop',
  body,
  action,
  buttonLabel = 'Subscribe',
  legalLine,
}: NewsletterSignupProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface-raised p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground lg:text-3xl">
          {heading}
        </h2>
        {body ? (
          <p className="mb-6 text-base text-muted-foreground">{body}</p>
        ) : null}
        <form
          action={action}
          method="POST"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {buttonLabel}
          </button>
        </form>
        {legalLine ? (
          <p className="mt-3 text-xs text-muted-foreground">{legalLine}</p>
        ) : null}
      </div>
    </section>
  )
}
