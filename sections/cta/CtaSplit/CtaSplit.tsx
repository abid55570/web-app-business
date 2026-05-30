/**
 * CtaSplit — copy left (col-span-2 on lg), form right (col-span-1 on lg).
 * Stacks below lg. Zero-JS form posts to `action`.
 */
export type CtaSplitProps = {
  eyebrow?: string
  headline: string
  body?: string
  action: string
  fieldLabel?: string
  buttonLabel?: string
}

export function CtaSplit({
  eyebrow,
  headline,
  body,
  action,
  fieldLabel = 'you@example.com',
  buttonLabel = 'Get started',
}: CtaSplitProps) {
  return (
    <section className="bg-surface-raised px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
            {headline}
          </h2>
          {body ? (
            <p className="max-w-prose text-base text-muted-foreground">{body}</p>
          ) : null}
        </div>
        <form
          action={action}
          method="POST"
          className="flex flex-col gap-3 sm:flex-row lg:flex-col"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={fieldLabel}
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
      </div>
    </section>
  )
}
