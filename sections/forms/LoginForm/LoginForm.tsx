export type LoginFormProps = {
  heading?: string
  action: string
  signupHref?: string
  forgotHref?: string
}

export function LoginForm({
  heading = 'Welcome back',
  action,
  signupHref = '/signup',
  forgotHref = '/forgot',
}: LoginFormProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
        <form action={action} method="POST" className="grid gap-4">
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
              autoComplete="current-password"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" name="remember" defaultChecked />
              Remember me
            </label>
            <a
              href={forgotHref}
              className="text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href={signupHref} className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </section>
  )
}
