export type HeroAuthFormProps = {
  headline: string
  body: string
  bullets?: string[]
  signupAction: string
  signupCtaLabel?: string
  loginHref?: string
}

export function HeroAuthForm({
  headline,
  body,
  bullets,
  signupAction,
  signupCtaLabel = 'Create account',
  loginHref,
}: HeroAuthFormProps) {
  return (
    <section className="px-6 py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{body}</p>
          {bullets?.length ? (
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-emerald-500">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <form
          action={signupAction}
          method="POST"
          className="rounded-2xl border border-border bg-surface-raised p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Start your free account
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            No credit card required.
          </p>
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                minLength={12}
                autoComplete="new-password"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {signupCtaLabel}
          </button>
          {loginHref ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <a
                href={loginHref}
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </a>
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
