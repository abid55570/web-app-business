export type SignupFormProps = {
  heading?: string
  action: string
  signinHref?: string
  showTermsCheckbox?: boolean
}

export function SignupForm({
  heading = 'Create your account',
  action,
  signinHref = '/signin',
  showTermsCheckbox = true,
}: SignupFormProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
        <form action={action} method="POST" className="grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Full name</span>
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
            <span className="font-medium text-foreground">Password</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <span className="text-xs text-muted-foreground">
              Minimum 8 characters.
            </span>
          </label>
          {showTermsCheckbox ? (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5"
              />
              <span>
                I agree to the{' '}
                <a href="/terms" className="underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          ) : null}
          <button
            type="submit"
            className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href={signinHref} className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </section>
  )
}
