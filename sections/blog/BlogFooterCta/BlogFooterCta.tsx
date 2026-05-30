export type BlogFooterCtaProps = {
  headline: string
  body?: string
  action: string
  ctaLabel?: string
  socialProof?: string
}

export function BlogFooterCta({
  headline,
  body,
  action,
  ctaLabel = 'Subscribe',
  socialProof,
}: BlogFooterCtaProps) {
  return (
    <aside className="mx-auto my-12 max-w-3xl rounded-2xl border border-border bg-surface-sunken p-8 text-center">
      <h2 className="text-2xl font-bold text-foreground">{headline}</h2>
      {body ? (
        <p className="mx-auto mt-2 max-w-xl text-base text-muted-foreground">
          {body}
        </p>
      ) : null}
      <form
        action={action}
        method="POST"
        className="mx-auto mt-5 flex max-w-md gap-2"
      >
        <label htmlFor="b-dash-blog-footer-email" className="sr-only">
          Email
        </label>
        <input
          id="b-dash-blog-footer-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </button>
      </form>
      {socialProof ? (
        <p className="mt-3 text-xs text-muted-foreground">{socialProof}</p>
      ) : null}
    </aside>
  )
}
