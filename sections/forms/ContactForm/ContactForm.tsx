/**
 * ContactForm — name + email + message → POST to `action`.
 * Renders zero-JS by default. Server endpoint owns validation/anti-spam.
 */
export type ContactFormProps = {
  heading?: string
  body?: string
  action: string
  submitLabel?: string
}

export function ContactForm({
  heading = 'Get in touch',
  body,
  action,
  submitLabel = 'Send message',
}: ContactFormProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-3 text-3xl font-bold text-foreground lg:text-4xl">
          {heading}
        </h2>
        {body ? (
          <p className="mb-8 text-base text-muted-foreground">{body}</p>
        ) : null}
        <form action={action} method="POST" className="grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Name</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Message</span>
            <textarea
              name="message"
              required
              rows={5}
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
