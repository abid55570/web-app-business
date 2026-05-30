export type HeroEmailCaptureProps = {
  eyebrow?: string
  headline: string
  body: string
  action: string
  placeholder?: string
  ctaLabel?: string
  trustText?: string
  bulletPoints?: string[]
}

export function HeroEmailCapture({
  eyebrow,
  headline,
  body,
  action,
  placeholder = 'you@company.com',
  ctaLabel = 'Get started',
  trustText,
  bulletPoints,
}: HeroEmailCaptureProps) {
  return (
    <section className="px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {body}
        </p>
        <form
          action={action}
          method="POST"
          className="mx-auto mt-8 flex max-w-md gap-2"
        >
          <label htmlFor="b-dash-hero-cap" className="sr-only">
            Email
          </label>
          <input
            id="b-dash-hero-cap"
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </button>
        </form>
        {trustText ? (
          <p className="mt-3 text-xs text-muted-foreground">{trustText}</p>
        ) : null}
        {bulletPoints?.length ? (
          <ul className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {bulletPoints.map((b, i) => (
              <li key={i} className="flex items-center gap-1">
                <span aria-hidden className="text-emerald-500">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
