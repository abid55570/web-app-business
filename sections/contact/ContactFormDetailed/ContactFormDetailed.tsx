export type ContactFormDetailedProps = {
  heading?: string
  subheading?: string
  reasons?: string[]
  submitLabel?: string
  privacyNote?: string
}

export function ContactFormDetailed({
  heading = 'Get in touch',
  subheading,
  reasons = ['General', 'Sales', 'Support', 'Partnership'],
  submitLabel = 'Send message',
  privacyNote,
}: ContactFormDetailedProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-3xl font-bold text-foreground">{heading}</h2>
        {subheading ? (
          <p className="mb-8 text-base text-muted-foreground">{subheading}</p>
        ) : null}
        <form className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                First name
              </label>
              <input
                name="first"
                required
                className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Last name
              </label>
              <input
                name="last"
                required
                className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Reason
            </label>
            <select
              name="reason"
              className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
            >
              {reasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            {privacyNote ? (
              <p className="text-xs text-muted-foreground">{privacyNote}</p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
